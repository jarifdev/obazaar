"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSuspenseQuery } from "@tanstack/react-query";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { QuantitySelector } from "@/components/ui/quantity-selector";
import { useTRPC } from "@/trpc/client";

import { useCart } from "@/modules/checkout/hooks/use-cart";

interface Props {
  tenantSlug: string;
  productId: string;
  isPurchased?: boolean;
}

export const QuantityCartButton = ({
  tenantSlug,
  productId,
  isPurchased,
}: Props) => {
  const cart = useCart(tenantSlug);
  const router = useRouter();
  const [localQuantity, setLocalQuantity] = useState(1);

  const trpc = useTRPC();
  const { data: product } = useSuspenseQuery(
    trpc.products.getOne.queryOptions({ id: productId })
  );

  const currentQuantity = cart.getProductQuantity(productId);
  const isInCart = cart.isProductInCart(productId);

  // Calculate max quantity based on stock
  const maxQuantity = product.trackInventory
    ? product.allowBackorders
      ? 999
      : Math.max(0, product.stock || 0)
    : 999;

  const isOutOfStock =
    product.trackInventory &&
    (product.stock || 0) <= 0 &&
    !product.allowBackorders;
  const isLowStock =
    product.trackInventory &&
    (product.stock || 0) <= (product.lowStockThreshold || 5) &&
    (product.stock || 0) > 0;

  if (isPurchased) {
    return (
      <Button
        variant="elevated"
        onClick={() => {
          const libraryUrl = `${process.env.NEXT_PUBLIC_APP_URL}/library/${productId}`;
          try {
            router.replace(libraryUrl);
            setTimeout(() => {
              if (window.location.href !== libraryUrl) {
                window.location.href = libraryUrl;
              }
            }, 100);
          } catch (error) {
            console.error("Router navigation failed:", error);
            window.location.href = libraryUrl;
          }
        }}
        className="flex-1 font-medium bg-white"
      >
        View in Library
      </Button>
    );
  }

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
          max={maxQuantity}
          className="flex-shrink-0"
        />
        <Button
          variant="elevated"
          className="flex-1 bg-[#fab803] h-9 text-sm min-w-0 px-3"
          onClick={() => cart.addProduct(productId, localQuantity)}
          disabled={maxQuantity === 0}
        >
          Add to cart
          {isLowStock && (
            <span className="ml-1 text-xs">({product.stock || 0} left)</span>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex gap-2 items-center min-w-0">
      <QuantitySelector
        quantity={currentQuantity}
        onChange={(quantity) => cart.updateQuantity(productId, quantity)}
        max={maxQuantity}
        className="flex-shrink-0"
      />
      <Button
        variant="elevated"
        className="flex-1 bg-white border min-w-0"
        onClick={() => cart.removeProduct(productId)}
      >
        Remove from cart
      </Button>
    </div>
  );
};

// Legacy component for backward compatibility
export const CartButton = ({ tenantSlug, productId, isPurchased }: Props) => {
  const cart = useCart(tenantSlug);
  const router = useRouter();

  if (isPurchased) {
    return (
      <Button
        variant="elevated"
        onClick={() => {
          const libraryUrl = `${process.env.NEXT_PUBLIC_APP_URL}/library/${productId}`;
          try {
            router.replace(libraryUrl);
            setTimeout(() => {
              if (window.location.href !== libraryUrl) {
                window.location.href = libraryUrl;
              }
            }, 100);
          } catch (error) {
            console.error("Router navigation failed:", error);
            window.location.href = libraryUrl;
          }
        }}
        className="flex-1 font-medium bg-white"
      >
        View in Library
      </Button>
    );
  }

  return (
    <Button
      variant="elevated"
      className={cn(
        "flex-1 bg-[#fab803] h-9 text-sm",
        cart.isProductInCart(productId) && "bg-white"
      )}
      onClick={() => cart.toggleProduct(productId)}
    >
      {cart.isProductInCart(productId) ? "Remove from cart" : "Add to cart"}
    </Button>
  );
};
