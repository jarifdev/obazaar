import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@/payload.config";
import { walletService } from "@/lib/wallet-service";
import { headers as getHeaders } from "next/headers";
import { isSuperAdmin } from "@/lib/access";

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config });
    const headers = await getHeaders();
    const session = await payload.auth({ headers });

    // Only super admins can create payouts
    if (!session.user || !isSuperAdmin(session.user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { walletId, amount } = await req.json();

    if (!walletId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: "Valid wallet ID and amount required" },
        { status: 400 }
      );
    }

    // Create the payout using wallet service
    const payoutId = await walletService.requestPayout(walletId, amount);

    return NextResponse.json({
      success: true,
      payoutId,
      message: "Payout created successfully",
    });
  } catch (error) {
    console.error("Error creating admin payout:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create payout",
      },
      { status: 500 }
    );
  }
}
