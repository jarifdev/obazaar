import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@/payload.config";
import { headers as getHeaders } from "next/headers";
import { isSuperAdmin } from "@/lib/access";

export async function GET(req: NextRequest) {
  try {
    const payload = await getPayload({ config });
    const headers = await getHeaders();
    const session = await payload.auth({ headers });

    // Only super admins can access this
    if (!session.user || !isSuperAdmin(session.user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all wallets with tenant information
    const wallets = await payload.find({
      collection: "wallets",
      depth: 2, // Include tenant details
      limit: 100, // Adjust as needed
      sort: "-totalEarnings", // Sort by highest earnings first
    });

    // Format the data for the admin interface
    const walletsData = wallets.docs.map((wallet) => ({
      id: wallet.id,
      tenant: {
        id:
          typeof wallet.tenant === "string" ? wallet.tenant : wallet.tenant.id,
        name:
          typeof wallet.tenant === "string" ? "Unknown" : wallet.tenant.name,
        slug:
          typeof wallet.tenant === "string" ? "unknown" : wallet.tenant.slug,
        paymentInfo:
          typeof wallet.tenant === "string" ? null : wallet.tenant.paymentInfo,
      },
      availableBalance: wallet.availableBalance || 0,
      pendingBalance: wallet.pendingBalance || 0,
      totalEarnings: wallet.totalEarnings || 0,
    }));

    // Filter out wallets with no earnings
    const activeWallets = walletsData.filter(
      (wallet) =>
        wallet.totalEarnings > 0 ||
        wallet.availableBalance > 0 ||
        wallet.pendingBalance > 0
    );

    return NextResponse.json({
      wallets: activeWallets,
      totalWallets: activeWallets.length,
      totalAvailableBalance: activeWallets.reduce(
        (sum, w) => sum + w.availableBalance,
        0
      ),
      totalPendingBalance: activeWallets.reduce(
        (sum, w) => sum + w.pendingBalance,
        0
      ),
      totalEarnings: activeWallets.reduce((sum, w) => sum + w.totalEarnings, 0),
    });
  } catch (error) {
    console.error("Error fetching wallets summary:", error);
    return NextResponse.json(
      { error: "Failed to fetch wallets summary" },
      { status: 500 }
    );
  }
}
