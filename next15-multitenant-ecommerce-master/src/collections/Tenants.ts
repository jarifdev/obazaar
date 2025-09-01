import type { CollectionConfig } from "payload";
import { isSuperAdmin } from "@/lib/access";

export const Tenants: CollectionConfig = {
  slug: "tenants",
  access: {
    create: ({ req }) => isSuperAdmin(req.user),
    read: ({ req }) => isSuperAdmin(req.user),
    update: ({ req }) => isSuperAdmin(req.user),
    delete: ({ req }) => isSuperAdmin(req.user),
  },
  admin: {
    useAsTitle: "slug",
  },
  hooks: {
    beforeChange: [
      ({ data, req }) => {
        // Auto-verify business when status is set to approved
        if (data.status === "approved" && !data.businessVerified) {
          data.businessVerified = true;
        }

        // Auto-unverify business when status is rejected or suspended
        if (
          (data.status === "rejected" || data.status === "suspended") &&
          data.businessVerified
        ) {
          data.businessVerified = false;
        }

        return data;
      },
    ],
  },
  fields: [
    {
      name: "name",
      required: true,
      type: "text",
      label: "Store Name",
      admin: {
        description: "This is the name of the store (e.g. Antonio's Store)",
      },
    },
    {
      name: "slug",
      type: "text",
      index: true,
      required: true,
      unique: true,
      access: {
        update: ({ req }) => isSuperAdmin(req.user),
      },
      admin: {
        description:
          "This is the subdomain for the store (e.g. [slug].obazaar.com)",
      },
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
    },
    // NEW: Business Registration Fields (replacing Stripe)
    {
      name: "isBusinessRegistered",
      type: "checkbox",
      required: true,
      defaultValue: false,
      label: "Business Registered",
      admin: {
        description: "Confirmation that the business is legally registered",
      },
    },
    {
      name: "businessCRNumber",
      type: "text",
      required: true,
      label: "Business CR Number",
      admin: {
        description: "Commercial Registration number (6-12 digits)",
      },
      validate: (value: any, { data }: any) => {
        if (!value && data?.isBusinessRegistered) {
          return "Business CR Number is required for registered businesses";
        }
        // Validate CR number format for Oman
        if (value && !/^\d{6,12}$/.test(value)) {
          return "CR Number must be 6-12 digits";
        }
        return true;
      },
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "pending",
      options: [
        { label: "Pending Review", value: "pending" },
        { label: "Approved", value: "approved" },
        { label: "Rejected", value: "rejected" },
        { label: "Suspended", value: "suspended" },
      ],
      access: {
        update: ({ req }) => isSuperAdmin(req.user),
      },
      admin: {
        description: "Current approval status of the tenant",
      },
    },
    {
      name: "businessVerified",
      type: "checkbox",
      defaultValue: false,
      label: "Business Verified",
      access: {
        update: ({ req }) => isSuperAdmin(req.user),
      },
      admin: {
        description:
          "Admin verification of business registration (replaces Stripe verification)",
      },
    },
    // Payment Information
    {
      name: "paymentInfo",
      type: "group",
      label: "Payment Information",
      admin: {
        description: "Information needed to send payouts to this vendor",
      },
      fields: [
        {
          name: "paypalEmail",
          type: "email",
          required: false,
          label: "PayPal Email",
          admin: {
            description: "PayPal email address for receiving payouts",
          },
        },
        {
          name: "preferredPayoutMethod",
          type: "select",
          defaultValue: "paypal",
          options: [
            { label: "PayPal", value: "paypal" },
            { label: "Bank Transfer", value: "bank_transfer" },
            { label: "Manual/Cash", value: "manual" },
          ],
          admin: {
            description: "Preferred method for receiving payouts",
          },
        },
        {
          name: "bankDetails",
          type: "group",
          label: "Bank Details",
          admin: {
            condition: (data) =>
              data.paymentInfo?.preferredPayoutMethod === "bank_transfer",
            description: "Bank account details for direct transfers",
          },
          fields: [
            {
              name: "accountHolderName",
              type: "text",
              label: "Account Holder Name",
            },
            {
              name: "bankName",
              type: "text",
              label: "Bank Name",
            },
            {
              name: "accountNumber",
              type: "text",
              label: "Account Number",
            },
            {
              name: "routingNumber",
              type: "text",
              label: "Routing Number / IBAN",
            },
          ],
        },
        {
          name: "minimumPayoutAmount",
          type: "number",
          defaultValue: 10,
          min: 1,
          label: "Minimum Payout Amount (USD)",
          admin: {
            description:
              "Minimum amount required before payout can be requested",
          },
        },
      ],
    },
    // OPTIONAL: Keep Stripe fields for payment processing (not verification)
    {
      name: "stripeAccountId",
      type: "text",
      required: false, // Changed to optional
      access: {
        update: ({ req }) => isSuperAdmin(req.user),
      },
      admin: {
        description: "Optional: Stripe Account ID for payment processing",
      },
    },
    // Remove stripeDetailsSubmitted field completely
  ],
};
