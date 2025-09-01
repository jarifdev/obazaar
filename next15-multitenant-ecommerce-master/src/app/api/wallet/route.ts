import { NextRequest, NextResponse } from "next/server";
import { walletService } from "@/lib/wallet-service";
import { getPayload } from "payload";
import config from "@/payload.config";
import { headers as getHeaders } from "next/headers";

export async function GET(req: NextRequest) {
  try {
    const payload = await getPayload({ config });
    const headers = await getHeaders();
    const session = await payload.auth({ headers });

    if (!session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's tenant
    const userTenants = session.user.tenants;
    if (!userTenants || userTenants.length === 0) {
      return NextResponse.json({ error: "No tenant found" }, { status: 400 });
    }

    const firstTenant = userTenants[0];
    if (!firstTenant) {
      return NextResponse.json({ error: "Invalid tenant" }, { status: 400 });
    }

    // Get tenant ID from the multi-tenant plugin structure
    const tenantId =
      typeof firstTenant.tenant === "string"
        ? firstTenant.tenant
        : firstTenant.tenant?.id;

    if (!tenantId) {
      return NextResponse.json({ error: "Invalid tenant ID" }, { status: 400 });
    }

    // Get wallet balance
    const balance = await walletService.getWalletBalance(tenantId);

    // Get recent transactions
    const transactions = await payload.find({
      collection: "wallet-transactions",
      where: {
        "wallet.tenant": {
          equals: tenantId,
        },
      },
      limit: 10,
      sort: "-createdAt",
    });

    // Get pending payouts
    const payouts = await payload.find({
      collection: "payouts",
      where: {
        and: [
          {
            "wallet.tenant": {
              equals: tenantId,
            },
          },
          {
            status: {
              in: ["pending", "processing"],
            },
          },
        ],
      },
    });

    return NextResponse.json({
      balance,
      transactions: transactions.docs,
      pendingPayouts: payouts.docs,
    });
  } catch (error) {
    console.error("Error fetching wallet data:", error);
    return NextResponse.json(
      { error: "Failed to fetch wallet data" },
      { status: 500 }
    );
  }
}
