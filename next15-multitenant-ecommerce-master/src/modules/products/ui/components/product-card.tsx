"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
// Using a minimal inline SVG for star to avoid bringing the full icon lib into the client bundle

import { formatCurrency, generateTenantURL } from "@/lib/utils";

interface ProductCardProps {
  id: string;
  name: string;
  imageUrl?: string | null;
  tenantSlug: string;
  tenantImageUrl?: string | null;
  reviewRating: number;
  reviewCount: number;
  price: number;
}

export const ProductCard = ({
  id,
  name,
  imageUrl,
  tenantSlug,
  tenantImageUrl,
  reviewRating,
  reviewCount,
  price,
}: ProductCardProps) => {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const productUrl = `${generateTenantURL(tenantSlug)}/products/${id}`;

  // Prevent multiple rapid clicks
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (isNavigating) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      setIsNavigating(true);

      console.log(`Product clicked: ${name}, navigating to: ${productUrl}`);

      try {
        router.push(productUrl);
        // Fallback navigation if router doesn't work
        setTimeout(() => {
          if (
            window.location.pathname !==
            productUrl.replace(window.location.origin, "")
          ) {
            window.location.href = productUrl;
          }
        }, 100);
      } catch (error) {
        console.error("Router navigation failed:", error);
        window.location.href = productUrl;
      }

      // Reset navigation state after a delay to prevent double-clicks
      setTimeout(() => {
        setIsNavigating(false);
      }, 1000);
    },
    [isNavigating, router, productUrl, name]
  );

  return (
    <div
      onClick={handleClick}
      className="block hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow border rounded-md bg-white overflow-hidden h-full flex flex-col cursor-pointer"
      style={{ pointerEvents: isNavigating ? "none" : "auto" }}
    >
      <div className="relative aspect-square">
        <Image
          alt={name}
          fill
          src={imageUrl || "/placeholder.png"}
          className="object-cover"
          priority={false}
          loading="lazy"
        />
      </div>

      <div className="p-4 border-y flex flex-col gap-3 flex-1">
        <h2 className="text-lg font-medium line-clamp-4">{name}</h2>

        <div className="flex items-center gap-2">
          {tenantImageUrl && (
            <Image
              alt={tenantSlug}
              src={tenantImageUrl}
              width={16}
              height={16}
              className="rounded-full border shrink-0 size-[16px]"
              loading="lazy"
            />
          )}

          <span className="text-sm underline font-medium">{tenantSlug}</span>
        </div>

        {reviewCount > 0 && (
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4 fill-black" viewBox="0 0 24 24" aria-hidden>
              <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.556L19.335 24 12 19.897 4.665 24l1.635-8.694L.6 9.75l7.732-1.732L12 .587z" />
            </svg>
            <p className="text-sm font-medium">
              {reviewRating.toFixed(1)} ({reviewCount})
            </p>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="relative px-2 py-1 border bg-[#fab803] w-fit">
          <p className="text-sm font-medium text-black">
            {formatCurrency(price)}
          </p>
        </div>
      </div>
    </div>
  );
};

export const ProductCardSkeleton = () => {
  return (
    <div className="w-full aspect-3/4 bg-neutral-200 rounded-lg animate-pulse" />
  );
};
