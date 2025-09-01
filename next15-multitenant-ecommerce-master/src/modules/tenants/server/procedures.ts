import z from "zod";
import { TRPCError } from "@trpc/server";
import { Media, Tenant, Product } from "@/payload-types";

import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";

export const tenantsRouter = createTRPCRouter({
  getOne: baseProcedure
    .input(
      z.object({
        slug: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const tenantsData = await ctx.db.find({
        collection: "tenants",
        depth: 1, // "tenant.image" is a type of "Media"
        where: {
          slug: {
            equals: input.slug,
          },
        },
        limit: 1,
        pagination: false,
      });

      const tenant = tenantsData.docs[0];

      if (!tenant) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Tenant not found" });
      }

      return tenant as Tenant & { image: Media | null };
    }),

  getMyProducts: protectedProcedure.query(async ({ ctx }) => {
    // Get user's tenant
    const userTenants = ctx.session.user.tenants;
    if (!userTenants || userTenants.length === 0) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "User is not associated with any tenant",
      });
    }

    const firstTenant = userTenants[0];
    if (!firstTenant) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "No tenant found",
      });
    }

    const tenantId =
      typeof firstTenant.tenant === "object"
        ? firstTenant.tenant.id
        : firstTenant.tenant;

    // Get products for this tenant
    const productsData = await ctx.db.find({
      collection: "products",
      depth: 1,
      where: {
        tenant: {
          equals: tenantId,
        },
      },
      sort: "-createdAt",
    });

    return {
      ...productsData,
      docs: productsData.docs.map((doc) => ({
        ...doc,
        image: doc.image as Media | null,
      })),
    };
  }),
});
