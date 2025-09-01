import type { CollectionConfig } from "payload";
import { isSuperAdmin } from "@/lib/access";

export const WalletTransactions: CollectionConfig = {
  slug: "wallet-transactions",
  access: {
    read: ({ req }) => {
      if (isSuperAdmin(req.user)) return true;
      // Tenants can only read their own transactions
      const userTenantId = req.user?.tenants?.[0]?.tenant;
      if (!userTenantId) return false;

      return {
        "wallet.tenant": {
          equals: userTenantId,
        },
      };
    },
    create: ({ req }) => isSuperAdmin(req.user),
    update: ({ req }) => isSuperAdmin(req.user),
    delete: ({ req }) => isSuperAdmin(req.user),
  },
  admin: {
    useAsTitle: "id",
    defaultColumns: ["wallet", "type", "amount", "status", "createdAt"],
    group: "Financial",
  },
  fields: [
    {
      name: "wallet",
      type: "relationship",
      relationTo: "wallets",
      required: true,
      hasMany: false,
    },
    {
      name: "type",
      type: "select",
      required: true,
      options: [
        { label: "Sale Earning", value: "earning" },
        { label: "Payout", value: "payout" },
        { label: "Refund Deduction", value: "refund" },
        { label: "Commission Adjustment", value: "commission_adjustment" },
        { label: "Manual Adjustment", value: "manual_adjustment" },
        { label: "Hold Release", value: "hold_release" },
      ],
    },
    {
      name: "amount",
      type: "number",
      required: true,
      admin: {
        description:
          "Transaction amount in USD (positive for credits, negative for debits)",
        step: 0.01,
      },
    },
    {
      name: "grossAmount",
      type: "number",
      admin: {
        description: "Original sale amount before commission (for earnings)",
        step: 0.01,
      },
    },
    {
      name: "commissionAmount",
      type: "number",
      admin: {
        description: "Platform commission deducted (for earnings)",
        step: 0.01,
      },
    },
    {
      name: "description",
      type: "textarea",
      required: true,
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "completed",
      options: [
        { label: "Pending", value: "pending" },
        { label: "Completed", value: "completed" },
        { label: "Failed", value: "failed" },
        { label: "Cancelled", value: "cancelled" },
      ],
    },
    {
      name: "relatedOrder",
      type: "relationship",
      relationTo: "orders",
      hasMany: false,
      admin: {
        description: "Related order (for earnings/refunds)",
      },
    },
    {
      name: "relatedPayout",
      type: "relationship",
      relationTo: "payouts",
      hasMany: false,
      admin: {
        description: "Related payout record",
      },
    },
    {
      name: "paypalTransactionId",
      type: "text",
      admin: {
        description: "PayPal transaction ID for this transaction",
      },
    },
    {
      name: "availableAt",
      type: "date",
      admin: {
        description: "When this amount becomes available for withdrawal",
      },
    },
    {
      name: "metadata",
      type: "json",
      admin: {
        description: "Additional transaction metadata",
      },
    },
  ],
};
