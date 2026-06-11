"use client";

// ---------------------------------------------------------------------------
// CartIcon — header cart button with item-count badge
// ---------------------------------------------------------------------------

import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/features/cart/store";

export function CartIcon() {
  const itemCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));
  const toggleCart = useCartStore((s) => s.toggleCart);
  const hasHydrated = useCartStore((s) => s.hasHydrated);

  // Prevent SSR mismatch — render nothing until hydrated
  if (!hasHydrated) {
    return (
      <Button variant="ghost" size="icon" className="relative" aria-label="Cart">
        <ShoppingBag className="size-5" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative"
      onClick={toggleCart}
      aria-label={`Cart (${itemCount} items)`}
    >
      <ShoppingBag className="size-5" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 inline-flex items-center justify-center size-5 rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </Button>
  );
}
