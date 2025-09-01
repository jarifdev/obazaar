"use client";

import z from "zod";
import Link from "next/link";
import { toast } from "sonner";
import { Poppins } from "next/font/google";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";

import { useTRPC } from "@/trpc/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { customerRegisterSchema } from "../../schemas";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["700"],
});

export const CustomerSignUpView = () => {
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const register = useMutation(
    trpc.auth.registerCustomer.mutationOptions({
      onError: (error) => {
        toast.error(error.message);
      },
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.auth.session.queryFilter());
        toast.success("Welcome! Your account has been created.");
        router.push("/");
      },
    })
  );

  const form = useForm<z.infer<typeof customerRegisterSchema>>({
    mode: "all",
    resolver: zodResolver(customerRegisterSchema),
    defaultValues: {
      email: "",
      password: "",
      username: "",
      phone: "",
    },
  });

  const onSubmit = (values: z.infer<typeof customerRegisterSchema>) => {
    register.mutate(values);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5">
      <div className="bg-[#F4F4F0] h-screen w-full lg:col-span-3 overflow-y-auto">
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

            <h1 className="text-4xl font-medium">Join Obazaar as a Customer</h1>

            <p className="text-sm text-gray-500 mt-2">
              Want to sell products?
              <Link href="/sign-up" className="text-primary underline ml-1">
                Create a vendor account instead
              </Link>
            </p>

            {/* Username */}
            <FormField
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Username</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter your username" />
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
                    <Input
                      {...field}
                      type="email"
                      placeholder="Enter your email"
                    />
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
                    <Input
                      {...field}
                      type="password"
                      placeholder="Create a password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Customer Account:</strong> Perfect for browsing and
                purchasing products from our marketplace vendors.
              </p>
            </div>

            {/* 🔵 Blue hover (#1c476f), no pink */}
            <Button
              disabled={register.isPending}
              type="submit"
              size="lg"
              variant="elevated"
              className="bg-black text-white hover:bg-[#1c476f] hover:text-white"
            >
              {register.isPending
                ? "Creating account..."
                : "Create Customer Account"}
            </Button>
          </form>
        </Form>
      </div>

      <div
        className="h-screen w-full lg:col-span-2 hidden lg:block"
        style={{
          backgroundImage: "url('/p1.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
    </div>
  );
};
