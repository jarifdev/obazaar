"use client";

import Link from "next/link";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSuspenseQuery } from "@tanstack/react-query";

import { cn, generateTenantURL } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { QuantitySelector } from "@/components/ui/quantity-selector";
import { useTRPC } from "@/trpc/client";

import { useCart } from "@/modules/checkout/hooks/use-cart";

interface Props {
  tenantSlug: string;
  productId: string;
  isPurchased?: boolean;
}

export const CustomerCartButton = ({
  tenantSlug,
  productId,
  isPurchased,
}: Props) => {
  const cart = useCart(tenantSlug);
  const router = useRouter();
  const [localQuantity, setLocalQuantity] = useState(1);
  const [isNavigating, setIsNavigating] = useState(false);

  const trpc = useTRPC();
  const { data: product } = useSuspenseQuery(
    trpc.products.getOne.queryOptions({ id: productId })
  );

  const currentQuantity = cart.getProductQuantity(productId);
  const isInCart = cart.isProductInCart(productId);

  // Calculate max quantity based on stock (but don't show to customer)
  const maxQuantity = product.trackInventory
    ? product.allowBackorders
      ? 999
      : Math.max(0, product.stock || 0)
    : 999;

  // Add debounced click handlers
  const handleViewCartClick = useCallback(() => {
    if (isNavigating) return;
    setIsNavigating(true);

    try {
      router.push(`${generateTenantURL(tenantSlug)}/checkout`);
    } catch (error) {
      console.error("Navigation failed:", error);
      window.location.href = `${generateTenantURL(tenantSlug)}/checkout`;
    }

    setTimeout(() => setIsNavigating(false), 1000);
  }, [router, tenantSlug, isNavigating]);

  const handleContinueShoppingClick = useCallback(() => {
    if (isNavigating) return;
    setIsNavigating(true);

    try {
      router.push(generateTenantURL(tenantSlug));
    } catch (error) {
      console.error("Navigation failed:", error);
      window.location.href = generateTenantURL(tenantSlug);
    }

    setTimeout(() => setIsNavigating(false), 1000);
  }, [router, tenantSlug, isNavigating]);

  const isOutOfStock =
    product.trackInventory &&
    (product.stock || 0) <= 0 &&
    !product.allowBackorders;

  // For purchased products, still show cart functionality instead of library
  // if (isPurchased) {
  //   return (
  //     <Button
  //       variant="elevated"
  //       onClick={() => {
  //         const libraryUrl = `${process.env.NEXT_PUBLIC_APP_URL}/library/${productId}`;
  //         try {
  //           router.replace(libraryUrl);
  //           setTimeout(() => {
  //             if (window.location.href !== libraryUrl) {
  //               window.location.href = libraryUrl;
  //             }
  //           }, 100);
  //         } catch (error) {
  //           console.error("Router navigation failed:", error);
  //           window.location.href = libraryUrl;
  //         }
  //       }}
  //       className="flex-1 font-medium bg-white"
  //     >
  //       View in Library
  //     </Button>
  //   );
  // }

  if (isOutOfStock) {
    return (
      <Button
        variant="elevated"
        disabled
        className="flex-1 bg-gray-300 text-gray-500"
      >
        Out of Stock
      </Button>
    );
  }

  if (!isInCart) {
    return (
      <div className="flex-1 flex gap-2 items-center min-w-0">
        <QuantitySelector
          quantity={localQuantity}
          onChange={setLocalQuantity}
          max={Math.min(maxQuantity, 99)} // Reasonable upper limit for customer
          className="flex-shrink-0"
        />
        <Button
          variant="elevated"
          className="flex-1 bg-[#fab803] h-9 text-sm min-w-0 px-3"
          onClick={() => cart.addProduct(productId, localQuantity)}
          disabled={maxQuantity === 0}
        >
          Add to cart
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-2">
      <div className="flex gap-2 items-center min-w-0">
        <QuantitySelector
          quantity={currentQuantity}
          onChange={(quantity) => cart.updateQuantity(productId, quantity)}
          max={Math.min(maxQuantity, 99)} // Reasonable upper limit for customer
          className="flex-shrink-0"
        />
        <Button
          variant="elevated"
          className="flex-1 bg-white border min-w-0"
          onClick={handleViewCartClick}
          disabled={isNavigating}
        >
          View Cart
        </Button>
      </div>
      <Button
        variant="elevated"
        className="w-full bg-gray-100 text-sm"
        onClick={handleContinueShoppingClick}
        disabled={isNavigating}
      >
        Continue Shopping
      </Button>
    </div>
  );
};

// Legacy component for backward compatibility
export const CartButton = ({ tenantSlug, productId, isPurchased }: Props) => {
  const cart = useCart(tenantSlug);
  const router = useRouter();

  // Remove special handling for purchased products - treat them like any other product
  // if (isPurchased) {
  //   return (
  //     <Button
  //       variant="elevated"
  //       onClick={() => {
  //         const libraryUrl = `${process.env.NEXT_PUBLIC_APP_URL}/library/${productId}`;
  //         try {
  //           router.replace(libraryUrl);
  //           setTimeout(() => {
  //             if (window.location.href !== libraryUrl) {
  //               window.location.href = libraryUrl;
  //             }
  //           }, 100);
  //         } catch (error) {
  //           console.error("Router navigation failed:", error);
  //           window.location.href = libraryUrl;
  //         }
  //       }}
  //       className="flex-1 font-medium bg-white"
  //     >
  //       View in Library
  //     </Button>
  //   );
  // }

  return (
    <Button
      variant="elevated"
      className={cn(
        "flex-1 bg-[#fab803] h-9 text-sm",
        cart.isProductInCart(productId) && "bg-white"
      )}
      onClick={() => {
        try {
          cart.toggleProduct(productId);
        } catch (error) {
          console.error("Failed to toggle product in cart:", error);
        }
      }}
    >
      {cart.isProductInCart(productId) ? "Remove from cart" : "Add to cart"}
    </Button>
  );
};
