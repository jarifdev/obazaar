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

    // Only super admins can process payouts
    if (!session.user || !isSuperAdmin(session.user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Process PayPal payouts
    await walletService.processPayPalPayouts();

    return NextResponse.json({
      success: true,
      message: "PayPal payouts processed successfully",
    });
  } catch (error) {
    console.error("Error processing PayPal payouts:", error);
    return NextResponse.json(
      { error: "Failed to process PayPal payouts" },
      { status: 500 }
    );
  }
}

// GET endpoint to check pending payouts
export async function GET(req: NextRequest) {
  try {
    const payload = await getPayload({ config });
    const headers = await getHeaders();
    const session = await payload.auth({ headers });

    if (!session.user || !isSuperAdmin(session.user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get pending payouts
    const pendingPayouts = await payload.find({
      collection: "payouts",
      where: {
        status: {
          equals: "pending",
        },
      },
      depth: 2,
    });

    // Get processing payouts
    const processingPayouts = await payload.find({
      collection: "payouts",
      where: {
        status: {
          equals: "processing",
        },
      },
      depth: 2,
    });

    return NextResponse.json({
      pendingPayouts: pendingPayouts.totalDocs,
      processingPayouts: processingPayouts.totalDocs,
      pending: pendingPayouts.docs.map((p) => ({
        id: p.id,
        amount: p.amount,
        method: p.method,
        recipientEmail: p.recipientEmail,
        requestedAt: p.requestedAt,
      })),
      processing: processingPayouts.docs.map((p) => ({
        id: p.id,
        amount: p.amount,
        method: p.method,
        recipientEmail: p.recipientEmail,
        paypalPayoutId: p.paypalPayoutId,
        processedAt: p.processedAt,
      })),
    });
  } catch (error) {
    console.error("Error checking payout status:", error);
    return NextResponse.json(
      { error: "Failed to check payout status" },
      { status: 500 }
    );
  }
}
