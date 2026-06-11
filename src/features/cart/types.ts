// ---------------------------------------------------------------------------
// Cart domain types
// ---------------------------------------------------------------------------

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  price: number; // already converted from Prisma Decimal
  currency: string; // "USD" | "ARS"
  quantity: number;
  image: string | null;
  stock: number;
}

export type AddItemResult =
  | { success: true }
  | {
      success: false;
      reason: "mixed-currency";
      currentCurrency: string;
      newCurrency: string;
    };

export interface CartState {
  items: CartItem[];
  // Hydration state — true once localStorage rehydrated
  hasHydrated: boolean;
  // Actions
  addItem: (item: Omit<CartItem, "quantity">) => AddItemResult;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  // Drawer
  isCartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  toggleCart: () => void;
  // Derived
  getItemCount: () => number;
  getSubtotal: () => number;
  getCurrency: () => string | null;
}
