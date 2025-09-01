import z from "zod";
import { TRPCError } from "@trpc/server";

import { Media, Tenant } from "@/payload-types";
import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";

import { generateTenantURL } from "@/lib/utils";

export const checkoutRouter = createTRPCRouter({
  purchase: protectedProcedure
    .input(
      z.object({
        productIds: z.array(z.string()).min(1),
        tenantSlug: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const products = await ctx.db.find({
        collection: "products",
        depth: 2,
        where: {
          and: [
            {
              id: {
                in: input.productIds,
              },
            },
            {
              "tenant.slug": {
                equals: input.tenantSlug,
              },
            },
            {
              isArchived: {
                not_equals: true,
              },
            },
          ],
        },
      });

      if (products.totalDocs !== input.productIds.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Products not found",
        });
      }

      const tenantsData = await ctx.db.find({
        collection: "tenants",
        limit: 1,
        pagination: false,
        where: {
          slug: {
            equals: input.tenantSlug,
          },
        },
      });

      const tenant = tenantsData.docs[0];

      if (!tenant) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tenant not found",
        });
      }

      // Check business verification instead of Stripe
      if (!tenant.businessVerified) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Vendor business is not verified",
        });
      }

      // Calculate total
      const totalAmount = products.docs.reduce(
        (acc, item) => acc + item.price,
        0
      );

      // Return data for PayPal order creation
      return {
        success: true,
        products: products.docs.map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price,
        })),
        totalAmount,
        userId: ctx.session.user.id,
      };
    }),

  getProducts: baseProcedure
    .input(
      z.object({
        items: z.array(
          z.object({
            productId: z.string(),
            quantity: z.number().min(1),
          })
        ),
      })
    )
    .query(async ({ ctx, input }) => {
      const productIds = input.items.map((item) => item.productId);

      const data = await ctx.db.find({
        collection: "products",
        depth: 2,
        where: {
          and: [
            {
              id: {
                in: productIds,
              },
            },
            {
              isArchived: {
                not_equals: true,
              },
            },
          ],
        },
      });

      if (data.totalDocs !== productIds.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Products not found",
        });
      }

      // Create a map for quick quantity lookup
      const quantityMap = Object.fromEntries(
        input.items.map((item) => [item.productId, item.quantity])
      );

      // Calculate total price with quantities
      const totalPrice = data.docs.reduce((acc, product) => {
        const price = Number(product.price);
        const quantity = quantityMap[product.id] || 1;
        return acc + (isNaN(price) ? 0 : price * quantity);
      }, 0);

      // Check stock availability for each item
      const stockErrors: string[] = [];
      data.docs.forEach((product) => {
        const requestedQuantity = quantityMap[product.id] || 1;
        if (product.trackInventory && !product.allowBackorders) {
          if ((product.stock || 0) < requestedQuantity) {
            stockErrors.push(
              `${product.name}: Only ${product.stock || 0} items available, but ${requestedQuantity} requested`
            );
          }
        }
      });

      if (stockErrors.length > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Insufficient stock: ${stockErrors.join(", ")}`,
        });
      }

      return {
        ...data,
        totalPrice: totalPrice,
        docs: data.docs.map((doc) => ({
          ...doc,
          quantity: quantityMap[doc.id] || 1,
          image: doc.image as Media | null,
          tenant: doc.tenant as Tenant & { image: Media | null },
        })),
      };
    }),
});
