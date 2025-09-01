"use client";

import z from "zod";
import Link from "next/link";
import { toast } from "sonner";
import { Poppins } from "next/font/google";
import type { ReactElement } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";

import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { registerSchema } from "../../schemas";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["700"],
});

interface CustomerSignUpViewProps {}

interface RegisterFormValues {
  email: string;
  password: string;
  username: string;
  phone: string;
}

export const CustomerSignUpView = (
  _props: CustomerSignUpViewProps = {}
): ReactElement => {
  const router = useRouter();

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const register = useMutation(
    trpc.auth.register.mutationOptions({
      onError: (error: unknown) => {
        const message = error instanceof Error ? error.message : String(error);
        toast.error(message);
      },
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.auth.session.queryFilter());
        toast.success("Registration successful! Welcome to our platform.");
        router.push("/");
      },
    })
  );

  const form = useForm<
    RegisterFormValues & {
      storeName: string;
      isBusinessRegistered: boolean;
      businessCRNumber: string;
    }
  >({
    mode: "all",
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      username: "",
      phone: "",
      storeName: "",
      isBusinessRegistered: false,
      businessCRNumber: "",
    },
  });

  const onSubmit = (
    values: RegisterFormValues & {
      storeName: string;
      isBusinessRegistered: boolean;
      businessCRNumber: string;
    }
  ): void => {
    register.mutate(values);
  };

  return (
    // ⬇️ lock viewport (no page/right scrollbar), create 1/5 split on lg
    <div className="fixed inset-0 grid grid-cols-1 lg:grid-cols-5 bg-[#F4F4F0]">
      {/* LEFT: scrollable form column */}
      <div className="h-full w-full lg:col-span-3 overflow-y-auto bg-[#F4F4F0]">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-8 p-4 lg:p-16"
          >
            <div className="flex items-center justify-between mb-8">
              <Link href="/">
                <Image
                  src="/2025-03-12-67d0edc2d777e.webp"
                  alt="Obazaar"
                  width={180}
                  height={54}
                  className="h-12 w-auto"
                  priority
                />
              </Link>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-base border-none underline"
              >
                <Link prefetch href="/sign-in">
                  Sign in
                </Link>
              </Button>
            </div>

            <h1 className="text-4xl font-medium">
              Join our platform and start your journey today.
            </h1>

            {/* Username */}
            <FormField
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Username</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Email</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone Number */}
<FormField
  name="phone"
  render={({ field }) => (
    <FormItem>
      <FormLabel className="text-base">Phone Number</FormLabel>
      <div className="flex">
        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 bg-gray-50 text-gray-500 text-sm">
          +968
        </span>
        <FormControl>
          <Input
            {...field}
            type="tel"
            inputMode="numeric"
            placeholder="8-digit number"
            className="rounded-l-none"
            onChange={(e) => {
              // keep only digits and cap at 8
              const v = e.target.value.replace(/\D/g, "").slice(0, 8);
              field.onChange(v);
            }}
            value={field.value}
            maxLength={8}
          />
        </FormControl>
      </div>
      <FormDescription>Enter 8 digits (no country code).</FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>


            {/* Password */}
            <FormField
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Password</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Store Name */}
            <FormField
              name="storeName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Store Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Business Registration */}
            <div className="border border-gray-200 rounded-lg p-6 bg-white">
              <h3 className="text-lg font-semibold mb-4">
                Business Registration
              </h3>

              {/* Registered checkbox */}
              <FormField
                name="isBusinessRegistered"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 mb-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        I confirm that my business is legally registered *
                      </FormLabel>
                      <FormDescription>
                        You must have a registered business to create a vendor
                        account
                      </FormDescription>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* CR number when registered */}
              {form.watch("isBusinessRegistered") && (
                <FormField
                  name="businessCRNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">
                        Business CR Number *
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter your Commercial Registration number (6-12 digits)"
                          maxLength={12}
                        />
                      </FormControl>
                      <FormDescription>
                        Your Commercial Registration (CR) number issued by the
                        Ministry of Commerce
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <Button
              disabled={register.isPending}
              type="submit"
              size="lg"
              variant="elevated"
              className="bg-black text-white hover:bg-[#1c476f] hover:text-white"
            >
              {register.isPending ? "Creating account..." : "Create account"}
            </Button>
          </form>
        </Form>
      </div>

      {/* RIGHT: non-scrollable image column */}
      <div
        className="h-full w-full lg:col-span-2 hidden lg:block overflow-hidden"
        style={{
          backgroundImage: "url('/p3.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
    </div>
  );
};
