import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface CartItem {
  productId: string;
  quantity: number;
}

interface TenantCart {
  items: CartItem[];
}

interface CartState {
  tenantCarts: Record<string, TenantCart>;
  addProduct: (
    tenantSlug: string,
    productId: string,
    quantity?: number
  ) => void;
  removeProduct: (tenantSlug: string, productId: string) => void;
  updateQuantity: (
    tenantSlug: string,
    productId: string,
    quantity: number
  ) => void;
  clearCart: (tenantSlug: string) => void;
  clearAllCarts: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      tenantCarts: {},
      addProduct: (tenantSlug, productId, quantity = 1) =>
        set((state) => {
          const existingCart = state.tenantCarts[tenantSlug] || { items: [] };
          const items = existingCart.items || []; // Ensure items is always an array
          const existingItemIndex = items.findIndex(
            (item) => item.productId === productId
          );

          if (existingItemIndex >= 0) {
            // Update existing item quantity
            const updatedItems = [...items];
            const existingItem = updatedItems[existingItemIndex];
            if (existingItem) {
              updatedItems[existingItemIndex] = {
                productId: existingItem.productId,
                quantity: existingItem.quantity + quantity,
              };
            }

            return {
              tenantCarts: {
                ...state.tenantCarts,
                [tenantSlug]: {
                  items: updatedItems,
                },
              },
            };
          } else {
            // Add new item
            return {
              tenantCarts: {
                ...state.tenantCarts,
                [tenantSlug]: {
                  items: [...items, { productId, quantity }],
                },
              },
            };
          }
        }),
      removeProduct: (tenantSlug, productId) =>
        set((state) => {
          const existingCart = state.tenantCarts[tenantSlug] || { items: [] };
          const items = existingCart.items || []; // Ensure items is always an array

          return {
            tenantCarts: {
              ...state.tenantCarts,
              [tenantSlug]: {
                items: items.filter((item) => item.productId !== productId),
              },
            },
          };
        }),
      updateQuantity: (tenantSlug, productId, quantity) =>
        set((state) => {
          const existingCart = state.tenantCarts[tenantSlug] || { items: [] };
          const items = existingCart.items || []; // Ensure items is always an array
          const updatedItems = items
            .map((item) =>
              item.productId === productId ? { ...item, quantity } : item
            )
            .filter((item) => item.quantity > 0); // Remove items with 0 quantity

          return {
            tenantCarts: {
              ...state.tenantCarts,
              [tenantSlug]: {
                items: updatedItems,
              },
            },
          };
        }),
      clearCart: (tenantSlug) =>
        set((state) => ({
          tenantCarts: {
            ...state.tenantCarts,
            [tenantSlug]: {
              items: [],
            },
          },
        })),
      clearAllCarts: () =>
        set({
          tenantCarts: {},
        }),
    }),
    {
      name: "Obazaar-cart",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
