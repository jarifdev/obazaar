import type { CollectionConfig } from "payload";
import { isSuperAdmin } from "@/lib/access";

export const Payouts: CollectionConfig = {
  slug: "payouts",
  access: {
    read: ({ req }) => {
      if (isSuperAdmin(req.user)) return true;
      // Tenants can only read their own payouts
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
    defaultColumns: [
      "wallet",
      "amount",
      "method",
      "status",
      "recipientEmail",
      "requestedAt",
    ],
    description: "Process vendor payouts and track payment status",
    listSearchableFields: ["wallet.tenant.name", "recipientEmail"],
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
      name: "amount",
      type: "number",
      required: true,
      admin: {
        description: "Payout amount in USD",
        step: 0.01,
      },
    },
    {
      name: "method",
      type: "select",
      required: true,
      options: [
        { label: "PayPal", value: "paypal" },
        { label: "Bank Transfer", value: "bank_transfer" },
        { label: "Manual", value: "manual" },
      ],
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "pending",
      options: [
        { label: "Pending", value: "pending" },
        { label: "Processing", value: "processing" },
        { label: "Completed", value: "completed" },
        { label: "Failed", value: "failed" },
        { label: "Cancelled", value: "cancelled" },
      ],
    },
    {
      name: "requestedAt",
      type: "date",
      required: true,
      defaultValue: () => new Date(),
    },
    {
      name: "processedAt",
      type: "date",
    },
    {
      name: "paypalPayoutId",
      type: "text",
      admin: {
        description: "PayPal payout batch ID",
      },
    },
    {
      name: "paypalPayoutItemId",
      type: "text",
      admin: {
        description: "PayPal payout item ID",
      },
    },
    {
      name: "recipientEmail",
      type: "email",
      admin: {
        description: "Email address for payout (PayPal)",
      },
    },
    {
      name: "bankDetails",
      type: "group",
      fields: [
        {
          name: "accountHolderName",
          type: "text",
        },
        {
          name: "accountNumber",
          type: "text",
        },
        {
          name: "bankName",
          type: "text",
        },
        {
          name: "swiftCode",
          type: "text",
        },
        {
          name: "iban",
          type: "text",
        },
      ],
      admin: {
        description: "Bank details used for this payout",
      },
    },
    {
      name: "notes",
      type: "textarea",
      admin: {
        description: "Internal notes about this payout",
      },
    },
    {
      name: "failureReason",
      type: "text",
      admin: {
        description: "Reason for payout failure",
      },
    },
    {
      name: "feeAmount",
      type: "number",
      admin: {
        description: "Processing fee charged for this payout",
        step: 0.01,
      },
    },
  ],
};
