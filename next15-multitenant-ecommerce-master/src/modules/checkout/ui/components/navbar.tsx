"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { generateTenantURL } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Props {
  slug: string;
};

export const Navbar = ({ slug }: Props) => {
  const router = useRouter();

  return (
    <nav className="h-20 border-b font-medium bg-white">
      <div className="max-w-(--breakpoint-xl) mx-auto flex justify-between items-center h-full px-4 lg:px-12">
        <p className="text-xl">Checkout</p>
        <Button
          variant="elevated"
          onClick={() => {
            const tenantUrl = generateTenantURL(slug);
            console.log(`Continue Shopping clicked, navigating to: ${tenantUrl}`);
            
            try {
              router.replace(tenantUrl);
              setTimeout(() => {
                if (window.location.href !== tenantUrl) {
                  window.location.href = tenantUrl;
                }
              }, 100);
            } catch (error) {
              console.error("Router navigation failed:", error);
              window.location.href = tenantUrl;
            }
          }}
        >
          Continue Shopping
        </Button>
      </div>
    </nav>
  );
};
