import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";

import { useCartStore } from "../store/use-cart-store";

export const useCart = (tenantSlug: string) => {
  const addProduct = useCartStore((state) => state.addProduct);
  const removeProduct = useCartStore((state) => state.removeProduct);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);
  const clearAllCarts = useCartStore((state) => state.clearAllCarts);

  const items = useCartStore(
    useShallow((state) => state.tenantCarts[tenantSlug]?.items || [])
  );

  const toggleProduct = useCallback(
    (productId: string, quantity = 1) => {
      const existingItem = items.find((item) => item.productId === productId);
      if (existingItem) {
        removeProduct(tenantSlug, productId);
      } else {
        addProduct(tenantSlug, productId, quantity);
      }
    },
    [addProduct, removeProduct, items, tenantSlug]
  );

  const isProductInCart = useCallback(
    (productId: string) => {
      return items.some((item) => item.productId === productId);
    },
    [items]
  );

  const getProductQuantity = useCallback(
    (productId: string) => {
      const item = items.find((item) => item.productId === productId);
      return item?.quantity || 0;
    },
    [items]
  );

  const clearTenantCart = useCallback(() => {
    clearCart(tenantSlug);
  }, [tenantSlug, clearCart]);

  const handleAddProduct = useCallback(
    (productId: string, quantity = 1) => {
      addProduct(tenantSlug, productId, quantity);
    },
    [addProduct, tenantSlug]
  );

  const handleRemoveProduct = useCallback(
    (productId: string) => {
      removeProduct(tenantSlug, productId);
    },
    [removeProduct, tenantSlug]
  );

  const handleUpdateQuantity = useCallback(
    (productId: string, quantity: number) => {
      updateQuantity(tenantSlug, productId, quantity);
    },
    [updateQuantity, tenantSlug]
  );

  // Get product IDs for backward compatibility
  const productIds = items.map((item) => item.productId);

  return {
    items,
    productIds, // Keep for backward compatibility
    addProduct: handleAddProduct,
    removeProduct: handleRemoveProduct,
    updateQuantity: handleUpdateQuantity,
    clearCart: clearTenantCart,
    clearAllCarts,
    toggleProduct,
    isProductInCart,
    getProductQuantity,
    totalItems: items.reduce((total, item) => total + item.quantity, 0),
    uniqueItems: items.length,
  };
};
