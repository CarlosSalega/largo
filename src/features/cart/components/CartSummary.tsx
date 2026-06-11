"use client";

// ---------------------------------------------------------------------------
// CartSummary — subtotal, item count, and checkout CTA
// ---------------------------------------------------------------------------

import Link from "next/link";
import { useShallow } from "zustand/react/shallow";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/formatPrice";
import { useCartStore } from "@/features/cart/store";

interface CartSummaryProps {
  /** If true, renders the "Proceed to Checkout" button */
  showCheckout?: boolean;
}

export function CartSummary({ showCheckout = true }: CartSummaryProps) {
  const { items, getSubtotal, getCurrency } = useCartStore(
    useShallow((s) => ({
      items: s.items,
      getSubtotal: s.getSubtotal,
      getCurrency: s.getCurrency,
    }))
  );

  if (items.length === 0) return null;

  const subtotal = getSubtotal();
  const currency = getCurrency() ?? "USD";
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between border-t border-border pt-3">
        <span className="text-sm text-muted-foreground">
          Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})
        </span>
        <span className="text-base font-semibold tabular-nums">
          {formatPrice(subtotal, currency)}
        </span>
      </div>
      {showCheckout && (
        <Button asChild className="w-full" size="lg">
          <Link href="/checkout">Proceed to Checkout</Link>
        </Button>
      )}
    </div>
  );
}
