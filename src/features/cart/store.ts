"use client";

// ---------------------------------------------------------------------------
// Zustand cart store — client-side state with localStorage persistence
// ---------------------------------------------------------------------------

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, CartState, AddItemResult } from "./types";
import { isMixedCurrency } from "./utils";

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      hasHydrated: false,
      isCartOpen: false,

      // -----------------------------------------------------------------------
      // setCartOpen / toggleCart — drawer state
      // -----------------------------------------------------------------------
      setCartOpen: (open: boolean) => set({ isCartOpen: open }),
      toggleCart: () => set((prev) => ({ isCartOpen: !prev.isCartOpen })),

      // -----------------------------------------------------------------------
      // addItem — mixed-currency guard, increment or push
      // -----------------------------------------------------------------------
      addItem: (product: Omit<CartItem, "quantity">): AddItemResult => {
        const state = get();

        // Mixed-currency guard
        if (isMixedCurrency(state.items, product.currency)) {
          return {
            success: false,
            reason: "mixed-currency",
            currentCurrency: state.items[0].currency,
            newCurrency: product.currency,
          };
        }

        set((prev) => {
          const existingIndex = prev.items.findIndex(
            (i) => i.productId === product.productId
          );

          if (existingIndex >= 0) {
            // Increment quantity, cap at stock
            const updated = [...prev.items];
            const current = updated[existingIndex];
            const newQty = Math.min(current.quantity + 1, current.stock);
            updated[existingIndex] = { ...current, quantity: newQty };
            return { items: updated };
          }

          // New item with quantity 1
          const newItem: CartItem = { ...product, quantity: 1 };
          return { items: [...prev.items, newItem] };
        });

        return { success: true };
      },

      // -----------------------------------------------------------------------
      // removeItem
      // -----------------------------------------------------------------------
      removeItem: (productId: string) => {
        set((prev) => ({
          items: prev.items.filter((i) => i.productId !== productId),
        }));
      },

      // -----------------------------------------------------------------------
      // updateQuantity — clamp between 1 and stock
      // -----------------------------------------------------------------------
      updateQuantity: (productId: string, quantity: number) => {
        set((prev) => ({
          items: prev.items.map((i) =>
            i.productId === productId
              ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stock)) }
              : i
          ),
        }));
      },

      // -----------------------------------------------------------------------
      // clearCart
      // -----------------------------------------------------------------------
      clearCart: () => {
        set({ items: [] });
      },

      // -----------------------------------------------------------------------
      // Derived helpers
      // -----------------------------------------------------------------------
      getItemCount: () => {
        return get().items.reduce((sum, i) => sum + i.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      },

      getCurrency: () => {
        const items = get().items;
        if (items.length === 0) return null;
        return items[0].currency;
      },
    }),
    {
      name: "largo-cart",
      // Exclude non-cart UI state from persistence
      partialize: (state) => ({
        items: state.items,
        hasHydrated: state.hasHydrated,
      }),
      onRehydrateStorage: () => {
        // useCartStore.setState is available on the store after creation
        return () => {
          useCartStore.setState({ hasHydrated: true });
        };
      },
    }
  )
);
