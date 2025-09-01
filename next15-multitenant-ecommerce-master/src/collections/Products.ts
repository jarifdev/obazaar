import type { CollectionConfig } from "payload";

import { Tenant } from "@/payload-types";
import { isSuperAdmin } from "@/lib/access";

export const Products: CollectionConfig = {
  slug: "products",
  access: {
    create: () => true,
    read: () => true,
    update: () => true,
    delete: ({ req }) => isSuperAdmin(req.user),
  },
  versions: {
    drafts: true,
  },
  hooks: {
    beforeChange: [
      ({ req, data }) => {
        // If no tenant is assigned and user has at least one tenant
        if (!data.tenant && req.user?.tenants?.[0]?.tenant) {
          const tenant = req.user.tenants[0].tenant;
          data.tenant =
            typeof tenant === "object" && "id" in tenant ? tenant.id : tenant;
        }
        return data;
      },
    ],
  },
  admin: {
    useAsTitle: "name",
    description:
      "Your business must be approved and verified before creating products",
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "description",
      type: "richText",
    },
    {
      name: "price",
      type: "number",
      required: true,
      admin: {
        description: "Price in USD",
      },
    },
    {
      name: "stock",
      type: "number",
      required: true,
      min: 0,
      admin: {
        description: "Number of items in stock",
      },
    },
    {
      name: "trackInventory",
      type: "checkbox",
      defaultValue: true,
      admin: {
        description: "Enable inventory tracking for this product",
      },
    },
    {
      name: "lowStockThreshold",
      type: "number",
      defaultValue: 5,
      min: 0,
      admin: {
        description: "Alert when stock falls below this number",
        condition: (data) => data.trackInventory,
      },
    },
    {
      name: "allowBackorders",
      type: "checkbox",
      defaultValue: false,
      admin: {
        description: "Allow customers to purchase when out of stock",
        condition: (data) => data.trackInventory,
      },
    },
    {
      name: "category",
      type: "relationship",
      relationTo: "categories",
      hasMany: false,
    },
    {
      name: "tags",
      type: "relationship",
      relationTo: "tags",
      hasMany: true,
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      admin: {
        description:
          "Tip: Upload images to Media collection first, then select them here to avoid form clearing",
      },
    },
    {
      name: "cover",
      type: "upload",
      relationTo: "media",
      admin: {
        description:
          "Tip: Upload images to Media collection first, then select them here to avoid form clearing",
      },
    },
    {
      name: "refundPolicy",
      type: "select",
      options: ["30-day", "14-day", "7-day", "3-day", "1-day", "no-refunds"],
      defaultValue: "30-day",
    },
    {
      name: "content",
      type: "richText",
      admin: {
        description:
          "Protected content only visible to customers after purchase. Add product documentation, downloadable files, getting started guides, and bonus materials. Supports Markdown formatting",
      },
    },
    {
      name: "isPrivate",
      label: "Private",
      defaultValue: false,
      type: "checkbox",
      admin: {
        description:
          "If checked, this product will not be shown on the public storefront",
      },
    },
    {
      name: "isArchived",
      label: "Archive",
      defaultValue: false,
      type: "checkbox",
      admin: {
        description: "If checked, this product will be archived",
      },
    },
  ],
};
