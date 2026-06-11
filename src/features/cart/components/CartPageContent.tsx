"use client";

// ---------------------------------------------------------------------------
// CartPageContent — full-page cart view (client component)
// ---------------------------------------------------------------------------

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/features/cart/store";
import { CartItem } from "./CartItem";
import { CartSummary } from "./CartSummary";

export function CartPageContent() {
  const items = useCartStore((s) => s.items);
  const hasHydrated = useCartStore((s) => s.hasHydrated);
  const clearCart = useCartStore((s) => s.clearCart);

  if (!hasHydrated) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 space-y-4">
        <div className="h-8 w-32 bg-muted rounded animate-pulse" />
        <div className="h-64 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
        <ShoppingBag
          className="size-16 text-muted-foreground mx-auto"
          strokeWidth={1.5}
        />
        <h1 className="text-2xl font-bold">Tu carrito está vacío</h1>
        <p className="text-muted-foreground">
          Parece que no agregaste nada todavía.
        </p>
        <Button asChild variant="outline" size="lg">
          <Link href="/catalog">Ver productos</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Carrito</h1>
        <Button variant="ghost" size="sm" onClick={clearCart}>
          Vaciar carrito
        </Button>
      </div>

      {/* Items */}
      <div className="rounded-xl border border-border bg-card p-4">
        {items.map((item) => (
          <CartItem key={item.productId} item={item} />
        ))}
      </div>

      {/* Summary */}
      <div className="rounded-xl border border-border bg-card p-4">
        <CartSummary />
      </div>

      {/* Continue shopping */}
      <div className="text-center">
        <Button asChild variant="link" size="sm">
          <Link href="/catalog">Seguir comprando</Link>
        </Button>
      </div>
    </div>
  );
}
