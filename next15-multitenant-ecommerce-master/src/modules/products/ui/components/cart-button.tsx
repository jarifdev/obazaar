import Link from "next/link";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import { useCart } from "@/modules/checkout/hooks/use-cart";

interface Props {
  tenantSlug: string;
  productId: string;
  isPurchased?: boolean;
}

export const CartButton = ({ tenantSlug, productId, isPurchased }: Props) => {
  const cart = useCart(tenantSlug);
  const router = useRouter();

  if (isPurchased) {
    return (
      <Button
        variant="elevated"
        onClick={() => {
          const libraryUrl = `${process.env.NEXT_PUBLIC_APP_URL}/library/${productId}`;
          console.log(`View in Library clicked, navigating to: ${libraryUrl}`);

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
