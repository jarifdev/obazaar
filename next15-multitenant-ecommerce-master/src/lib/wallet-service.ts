import { getPayload } from "payload";
import config from "@/payload.config";

export interface WalletService {
  processOrderEarning(orderId: string): Promise<void>;
  requestPayout(walletId: string, amount: number): Promise<string>;
  processScheduledReleases(): Promise<void>;
  getWalletBalance(
    tenantId: string
  ): Promise<{ available: number; pending: number; total: number }>;
}

export class WalletServiceImpl implements WalletService {
  private async getPayloadInstance() {
    return await getPayload({ config });
  }

  /**
   * Process earnings from a completed order
   */
  async processOrderEarning(orderId: string): Promise<void> {
    const payload = await this.getPayloadInstance();

    // Get the order with product and tenant info
    const order = await payload.findByID({
      collection: "orders",
      id: orderId,
      depth: 2,
    });

    if (!order || order.walletTransactionProcessed) {
      console.log(`Order ${orderId} already processed or not found`);
      return;
    }

    if (order.paymentStatus !== "completed") {
      console.log(`Order ${orderId} payment not completed`);
      return;
    }

    // Handle tenant ID properly
    const tenantId =
      typeof order.tenant === "string" ? order.tenant : order.tenant.id;

    // Get or create wallet for the tenant
    const wallet = await this.getOrCreateWallet(tenantId);

    if (!wallet) {
      throw new Error(`Could not create/find wallet for tenant ${tenantId}`);
    }

    const grossAmount = order.amountPaid || 0;
    const commissionRate = wallet.commissionRate || 0.1; // Default 10%
    const commissionAmount = grossAmount * commissionRate;
    const netEarning = grossAmount - commissionAmount;

    // Create wallet transaction
    // Calculate hold period (shortened for testing - normally 7 days)
    const holdUntil = new Date();
    holdUntil.setMinutes(holdUntil.getMinutes() + 1); // 1 minute for testing instead of 7 days

    await payload.create({
      collection: "wallet-transactions",
      data: {
        wallet: wallet.id,
        type: "earning",
        amount: netEarning,
        grossAmount,
        commissionAmount,
        description: `Earning from order: ${order.name}`,
        status: "completed",
        relatedOrder: orderId,
        availableAt: holdUntil.toISOString(),
      },
    });

    // Update wallet pending balance
    await payload.update({
      collection: "wallets",
      id: wallet.id,
      data: {
        pendingBalance: wallet.pendingBalance + netEarning,
        totalEarnings: wallet.totalEarnings + netEarning,
      },
    });

    // Update order
    await payload.update({
      collection: "orders",
      id: orderId,
      data: {
        platformCommission: commissionAmount,
        vendorEarning: netEarning,
        walletTransactionProcessed: true,
      },
    });

    console.log(
      `Processed earning for order ${orderId}: $${netEarning} (after $${commissionAmount} commission)`
    );
  }

  /**
   * Get or create wallet for a tenant
   */
  private async getOrCreateWallet(tenantId: string): Promise<any> {
    const payload = await this.getPayloadInstance();

    // Try to find existing wallet
    const existingWallets = await payload.find({
      collection: "wallets",
      where: {
        tenant: {
          equals: tenantId,
        },
      },
      limit: 1,
    });

    if (existingWallets.docs.length > 0) {
      return existingWallets.docs[0];
    }

    // Create new wallet
    const newWallet = await payload.create({
      collection: "wallets",
      data: {
        tenant: tenantId,
        availableBalance: 0,
        pendingBalance: 0,
        totalEarnings: 0,
        totalWithdrawn: 0,
        commissionRate: 0.1, // 10% default
        holdPeriodDays: 7,
        isActive: true,
      },
    });

    return newWallet;
  }

  /**
   * Process scheduled releases of pending funds
   */
  async processScheduledReleases(): Promise<void> {
    const payload = await this.getPayloadInstance();

    const now = new Date();

    // Find transactions that should be released
    const transactionsToRelease = await payload.find({
      collection: "wallet-transactions",
      where: {
        and: [
          {
            type: {
              equals: "earning",
            },
          },
          {
            availableAt: {
              less_than_equal: now,
            },
          },
          {
            status: {
              equals: "completed",
            },
          },
        ],
      },
    });

    for (const transaction of transactionsToRelease.docs) {
      await this.releaseTransaction(transaction.id);
    }
  }

  private async releaseTransaction(transactionId: string): Promise<void> {
    const payload = await this.getPayloadInstance();

    const transaction = await payload.findByID({
      collection: "wallet-transactions",
      id: transactionId,
    });

    if (!transaction) return;

    // Handle wallet ID properly
    const walletId =
      typeof transaction.wallet === "string"
        ? transaction.wallet
        : transaction.wallet.id;

    // Update wallet balances
    const wallet = await payload.findByID({
      collection: "wallets",
      id: walletId,
    });

    if (!wallet) return;

    await payload.update({
      collection: "wallets",
      id: wallet.id,
      data: {
        availableBalance: wallet.availableBalance + transaction.amount,
        pendingBalance: wallet.pendingBalance - transaction.amount,
      },
    });

    // Create release transaction record
    await payload.create({
      collection: "wallet-transactions",
      data: {
        wallet: wallet.id,
        type: "hold_release",
        amount: transaction.amount,
        description: `Hold period release for transaction ${transactionId}`,
        status: "completed",
      },
    });

    console.log(`Released $${transaction.amount} for wallet ${wallet.id}`);
  }

  /**
   * Request a payout
   */
  async requestPayout(walletId: string, amount: number): Promise<string> {
    const payload = await this.getPayloadInstance();

    const wallet = await payload.findByID({
      collection: "wallets",
      id: walletId,
      depth: 2, // Include tenant details
    });

    if (!wallet) {
      throw new Error("Wallet not found");
    }

    if (wallet.availableBalance < amount) {
      throw new Error("Insufficient available balance");
    }

    if (!wallet.isActive) {
      throw new Error("Wallet is not active");
    }

    // Get tenant payment info
    const tenant =
      typeof wallet.tenant === "string"
        ? await payload.findByID({ collection: "tenants", id: wallet.tenant })
        : wallet.tenant;

    if (!tenant) {
      throw new Error("Tenant not found");
    }

    const paypalEmail = tenant.paymentInfo?.paypalEmail;
    const preferredMethod =
      tenant.paymentInfo?.preferredPayoutMethod || "manual";

    // Create payout request
    const payout = await payload.create({
      collection: "payouts",
      data: {
        wallet: walletId,
        amount,
        method: paypalEmail ? "paypal" : preferredMethod,
        status: "pending",
        requestedAt: new Date().toISOString(),
        recipientEmail: paypalEmail,
        bankDetails: tenant.paymentInfo?.bankDetails,
      },
    });

    // Deduct from available balance immediately
    await payload.update({
      collection: "wallets",
      id: walletId,
      data: {
        availableBalance: wallet.availableBalance - amount,
      },
    });

    // Create transaction record
    await payload.create({
      collection: "wallet-transactions",
      data: {
        wallet: walletId,
        type: "payout",
        amount: -amount, // Negative for debit
        description: `Payout request #${payout.id}`,
        status: "completed",
        relatedPayout: payout.id,
      },
    });

    return payout.id;
  }

  /**
   * Get wallet balance for a tenant
   */
  async getWalletBalance(
    tenantId: string
  ): Promise<{ available: number; pending: number; total: number }> {
    const payload = await this.getPayloadInstance();

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
      return { available: 0, pending: 0, total: 0 };
    }

    const wallet = wallets.docs[0];
    if (!wallet) {
      return { available: 0, pending: 0, total: 0 };
    }

    return {
      available: wallet.availableBalance || 0,
      pending: wallet.pendingBalance || 0,
      total: wallet.totalEarnings || 0,
    };
  }

  /**
   * Process pending PayPal payouts
   */
  async processPayPalPayouts(): Promise<void> {
    const payload = await this.getPayloadInstance();

    // Find pending PayPal payouts
    const pendingPayouts = await payload.find({
      collection: "payouts",
      where: {
        and: [
          {
            method: {
              equals: "paypal",
            },
          },
          {
            status: {
              equals: "pending",
            },
          },
        ],
      },
      depth: 2,
    });

    for (const payout of pendingPayouts.docs) {
      try {
        if (!payout.recipientEmail) {
          console.error(`Payout ${payout.id} missing recipient email`);
          continue;
        }

        // Import PayPal function
        const { createPayPalPayout } = await import("./paypal");

        // Send PayPal payout
        const paypalResponse = await createPayPalPayout(
          payout.recipientEmail,
          payout.amount,
          `Marketplace payout - $${payout.amount}`
        );

        // Update payout with PayPal details
        await payload.update({
          collection: "payouts",
          id: payout.id,
          data: {
            status: "processing",
            processedAt: new Date().toISOString(),
            paypalPayoutId: paypalResponse.batch_header.payout_batch_id,
            paypalPayoutItemId: paypalResponse.items?.[0]?.payout_item_id,
          },
        });

        console.log(
          `PayPal payout sent for ${payout.id}: ${paypalResponse.batch_header.payout_batch_id}`
        );
      } catch (error) {
        console.error(`Failed to process PayPal payout ${payout.id}:`, error);

        // Mark as failed
        await payload.update({
          collection: "payouts",
          id: payout.id,
          data: {
            status: "failed",
            processedAt: new Date().toISOString(),
          },
        });
      }
    }
  }
}

// Singleton instance
export const walletService = new WalletServiceImpl();
