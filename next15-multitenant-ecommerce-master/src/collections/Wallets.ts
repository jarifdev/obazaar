import type { CollectionConfig } from "payload";
import { isSuperAdmin } from "@/lib/access";

export const Wallets: CollectionConfig = {
  slug: "wallets",
  access: {
    read: ({ req }) => {
      if (isSuperAdmin(req.user)) return true;
      // Tenants can only read their own wallet
      const userTenantId = req.user?.tenants?.[0]?.tenant;
      if (!userTenantId) return false;

      return {
        tenant: {
          equals: userTenantId,
        },
      };
    },
    create: ({ req }) => isSuperAdmin(req.user),
    update: ({ req }) => isSuperAdmin(req.user),
    delete: ({ req }) => isSuperAdmin(req.user),
  },
  admin: {
    useAsTitle: "tenant",
    defaultColumns: [
      "tenant",
      "availableBalance",
      "pendingBalance",
      "totalEarnings",
      "isActive",
    ],
    description: "Manage vendor wallet balances and track earnings",
    group: "Financial",
  },
  fields: [
    {
      name: "tenant",
      type: "relationship",
      relationTo: "tenants",
      required: true,
      unique: true,
      hasMany: false,
      admin: {
        description: "The tenant/vendor this wallet belongs to",
      },
    },
    {
      name: "availableBalance",
      type: "number",
      required: true,
      defaultValue: 0,
      admin: {
        description: "Balance available for withdrawal (USD)",
        step: 0.01,
      },
    },
    {
      name: "pendingBalance",
      type: "number",
      required: true,
      defaultValue: 0,
      admin: {
        description: "Balance pending from recent sales (holds for X days)",
        step: 0.01,
      },
    },
    {
      name: "totalEarnings",
      type: "number",
      required: true,
      defaultValue: 0,
      admin: {
        description: "Total lifetime earnings",
        step: 0.01,
      },
    },
    {
      name: "totalWithdrawn",
      type: "number",
      required: true,
      defaultValue: 0,
      admin: {
        description: "Total amount withdrawn to date",
        step: 0.01,
      },
    },
    {
      name: "commissionRate",
      type: "number",
      required: true,
      defaultValue: 0.1, // 10% platform commission
      min: 0,
      max: 1,
      admin: {
        description: "Platform commission rate (0.1 = 10%)",
        step: 0.01,
      },
    },
    {
      name: "holdPeriodDays",
      type: "number",
      required: true,
      defaultValue: 7, // 7 days hold period
      admin: {
        description: "Number of days to hold funds before making available",
      },
    },
    {
      name: "paypalEmail",
      type: "email",
      admin: {
        description: "PayPal email for payouts (optional)",
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
        description: "Bank details for manual payouts",
      },
    },
    {
      name: "isActive",
      type: "checkbox",
      defaultValue: true,
      admin: {
        description: "Whether this wallet is active for earnings",
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Ensure balances don't go negative
        if (data.availableBalance < 0) {
          data.availableBalance = 0;
        }
        if (data.pendingBalance < 0) {
          data.pendingBalance = 0;
        }
        return data;
      },
    ],
  },
};
