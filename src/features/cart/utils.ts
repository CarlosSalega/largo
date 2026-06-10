// ---------------------------------------------------------------------------
// Cart domain utilities — pure functions
// ---------------------------------------------------------------------------

import type { CartItem } from "./types";

/**
 * Returns the currency of all items in the cart (they must be uniform).
 * Returns null if the cart is empty.
 */
export function getCartCurrency(items: CartItem[]): string | null {
  if (items.length === 0) return null;
  return items[0].currency;
}

/**
 * Returns true if adding an item with `newCurrency` would create a
 * mixed-currency cart.
 */
export function isMixedCurrency(
  items: CartItem[],
  newCurrency: string
): boolean {
  if (items.length === 0) return false;
  return items[0].currency !== newCurrency;
}
