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

    // Only super admins can manually release funds
    if (!session.user || !isSuperAdmin(session.user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Release held funds
    await walletService.processScheduledReleases();

    return NextResponse.json({
      success: true,
      message: "Held funds released successfully",
    });
  } catch (error) {
    console.error("Error releasing held funds:", error);
    return NextResponse.json(
      { error: "Failed to release held funds" },
      { status: 500 }
    );
  }
}

// GET endpoint to check pending funds status
export async function GET(req: NextRequest) {
  try {
    const payload = await getPayload({ config });
    const headers = await getHeaders();
    const session = await payload.auth({ headers });

    if (!session.user || !isSuperAdmin(session.user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();

    // Get pending transactions
    const pendingTransactions = await payload.find({
      collection: "wallet-transactions",
      where: {
        and: [
          {
            type: {
              equals: "earning",
            },
          },
          {
            status: {
              equals: "completed",
            },
          },
        ],
      },
      depth: 2,
    });

    const readyToRelease = pendingTransactions.docs.filter(
      (transaction) => new Date(transaction.availableAt!) <= now
    );

    const stillPending = pendingTransactions.docs.filter(
      (transaction) => new Date(transaction.availableAt!) > now
    );

    return NextResponse.json({
      totalPendingTransactions: pendingTransactions.totalDocs,
      readyToRelease: readyToRelease.length,
      stillPending: stillPending.length,
      readyTransactions: readyToRelease.map((t) => ({
        id: t.id,
        amount: t.amount,
        availableAt: t.availableAt,
        description: t.description,
      })),
      pendingTransactions: stillPending.map((t) => ({
        id: t.id,
        amount: t.amount,
        availableAt: t.availableAt,
        description: t.description,
      })),
    });
  } catch (error) {
    console.error("Error checking fund status:", error);
    return NextResponse.json(
      { error: "Failed to check fund status" },
      { status: 500 }
    );
  }
}
