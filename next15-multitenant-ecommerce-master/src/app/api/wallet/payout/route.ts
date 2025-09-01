import { NextRequest, NextResponse } from "next/server";
import { walletService } from "@/lib/wallet-service";
import { getPayload } from "payload";
import config from "@/payload.config";
import { headers as getHeaders } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config });
    const headers = await getHeaders();
    const session = await payload.auth({ headers });

    if (!session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { amount } = await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
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
      return NextResponse.json({ error: "Invalid tenant" }, { status: 400 });
    }

    // Find wallet
    const wallets = await payload.find({
      collection: "wallets",
      where: {
        tenant: {
          equals: tenantId,
        },
      },
      limit: 1,
    });

    if (wallets.docs.length === 0) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    const wallet = wallets.docs[0];
    if (!wallet) {
      return NextResponse.json({ error: "Invalid wallet" }, { status: 404 });
    }

    // Request payout
    const payoutId = await walletService.requestPayout(wallet.id, amount);

    return NextResponse.json({
      payoutId,
      message: "Payout request submitted successfully",
    });
  } catch (error) {
    console.error("Error requesting payout:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to request payout",
      },
      { status: 500 }
    );
  }
}
