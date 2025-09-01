// src/modules/auth/server/procedures.ts
import { TRPCError } from "@trpc/server";
import { headers as getHeaders } from "next/headers";
import z from "zod";

// Remove stripe import
// import { stripe } from "@/lib/stripe";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";

import { generateAuthCookie } from "../utils";
import { loginSchema, customerRegisterSchema } from "../schemas";

// Updated register schema with business fields
const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(20),
  password: z.string().min(6),
  phone: z.string().regex(/^\d{8}$/, "Please enter exactly 8 digits (without country code)"),
  storeName: z.string().min(2),
  isBusinessRegistered: z.boolean(),
  businessCRNumber: z
    .string()
    .regex(/^\d{6,12}$/, "CR Number must be 6-12 digits"),
});

export const authRouter = createTRPCRouter({
  session: baseProcedure.query(async ({ ctx }) => {
    const headers = await getHeaders();
    const session = await ctx.db.auth({ headers });
    return session;
  }),

  register: baseProcedure
    .input(registerSchema)
    .mutation(async ({ input, ctx }) => {
      // Check if username is taken
      const existingData = await ctx.db.find({
        collection: "users",
        limit: 1,
        where: {
          username: {
            equals: input.username,
          },
        },
      });

      const existingUser = existingData.docs[0];

      if (existingUser) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Username already taken",
        });
      }

      // Validate business registration
      if (!input.isBusinessRegistered) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "You must have a registered business to create a vendor account",
        });
      }

      if (!input.businessCRNumber) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Business CR Number is required",
        });
      }

      // Create tenant with business info (no Stripe)
      const tenant = await ctx.db.create({
        collection: "tenants",
        data: {
          name: input.storeName || input.username,
          slug: input.username.toLowerCase(),
          isBusinessRegistered: input.isBusinessRegistered,
          businessCRNumber: input.businessCRNumber,
          businessVerified: false, // Admin will verify manually
          status: "pending", // or use the appropriate default value for status
          // No stripeAccountId needed for registration
        },
      });

      // Create user
      await ctx.db.create({
        collection: "users",
        data: {
          email: input.email,
          username: input.username,
          password: input.password, // This will be hashed
          phone: input.phone, // Add phone number
          tenants: [
            {
              tenant: tenant.id,
            },
          ],
        },
      });

      // Log the user in
      const data = await ctx.db.login({
        collection: "users",
        data: {
          email: input.email,
          password: input.password,
        },
      });

      if (!data.token) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Failed to login",
        });
      }

      await generateAuthCookie({
        prefix: ctx.db.config.cookiePrefix,
        value: data.token,
      });

      return {
        success: true,
        message:
          "Registration successful. Your business verification is pending admin approval.",
        tenant: tenant,
      };
    }),

  // Customer registration (no tenant/business info needed)
  registerCustomer: baseProcedure
    .input(customerRegisterSchema)
    .mutation(async ({ input, ctx }) => {
      // Check if username is taken
      const existingData = await ctx.db.find({
        collection: "users",
        limit: 1,
        where: {
          username: {
            equals: input.username,
          },
        },
      });

      if (existingData.docs[0]) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Username already taken",
        });
      }

      // Create user without tenant (customer account)
      await ctx.db.create({
        collection: "users",
        data: {
          email: input.email,
          username: input.username,
          password: input.password, // This will be hashed
          phone: input.phone, // Add phone number
          roles: ["user"], // Default user role
          // No tenants array - this is a customer
        },
      });

      // Log the user in
      const data = await ctx.db.login({
        collection: "users",
        data: {
          email: input.email,
          password: input.password,
        },
      });

      if (!data.token) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Failed to login",
        });
      }

      await generateAuthCookie({
        prefix: ctx.db.config.cookiePrefix,
        value: data.token,
      });

      return {
        success: true,
        message: "Customer account created successfully!",
        user: data.user,
      };
    }),

  login: baseProcedure.input(loginSchema).mutation(async ({ input, ctx }) => {
    const data = await ctx.db.login({
      collection: "users",
      data: {
        email: input.email,
        password: input.password,
      },
    });

    if (!data.token) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Failed to login",
      });
    }

    await generateAuthCookie({
      prefix: ctx.db.config.cookiePrefix,
      value: data.token,
    });

    return data;
  }),

  logout: baseProcedure.mutation(async ({ ctx }) => {
    await generateAuthCookie({
      prefix: ctx.db.config.cookiePrefix,
      value: "",
    });

    return {
      success: true,
      message: "Logged out successfully.",
    };
  }),
});
