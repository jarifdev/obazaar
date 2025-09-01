"use client";

import Link from "next/link";
import { Poppins } from "next/font/google";
import { useRouter } from "next/navigation";
import { UserIcon, ShoppingBagIcon } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["700"],
});

export const SignUpFront = () => {
  const router = useRouter();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5">
      {/* Left: content */}
      <div className="bg-[#F4F4F0] h-screen w-full lg:col-span-3 overflow-y-auto">
        <div className="flex flex-col gap-8 p-4 lg:p-16">
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
              <Link prefetch href="/sign-in">Sign in</Link>
            </Button>
          </div>

          <h1 className="text-4xl font-medium">Join Obazaar.</h1>
          <p className="text-lg text-gray-600">Choose how you'd like to get started</p>

          {/* Customer Sign Up */}
          <Link href="/sign-up-customer" className="block w-full">
            <div className="group p-6 border-2 border-gray-200 rounded-lg hover:border-[#1c476f] hover:bg-white transition-all duration-200 cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gray-100 rounded-lg group-hover:bg-[#1c476f] group-hover:text-white transition-colors">
                  <UserIcon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-medium mb-2 group-hover:text-[#1c476f] transition-colors">
                    Sign up as Customer
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Browse and purchase products, leave reviews, and manage your orders
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-[#1c476f] text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Get started as customer →
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* Vendor Sign Up */}
          <Link href="/sign-up" className="block w-full">
            <div className="group p-6 border-2 border-gray-200 rounded-lg hover:border-[#1c476f] hover:bg-white transition-all duration-200 cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gray-100 rounded-lg group-hover:bg-[#1c476f] group-hover:text-white transition-colors">
                  <ShoppingBagIcon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-medium mb-2 group-hover:text-[#1c476f] transition-colors">
                    Sign up as Vendor
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Sell your products, manage inventory, and track your business performance
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-[#1c476f] text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Get started as vendor →
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Right: full-height image */}
      <div className="relative h-screen w-full lg:col-span-2 hidden lg:block overflow-hidden">
        <Image
          src="/obazaar4.png"
          alt="Obazaar Sign Up Background"
          fill
          priority
          className="object-cover"
          sizes="(max-width: 1024px) 0px, 40vw"
        />
      </div>
    </div>
  );
};
