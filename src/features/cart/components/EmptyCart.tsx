"use client";

// ---------------------------------------------------------------------------
// EmptyCart — displayed when cart has no items
// ---------------------------------------------------------------------------

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12 px-4 text-center">
      <ShoppingBag className="size-12 text-muted-foreground" strokeWidth={1.5} />
      <p className="text-sm text-muted-foreground">Tu carrito está vacío</p>
      <Button asChild variant="outline" size="sm">
        <Link href="/catalog">Ver productos</Link>
      </Button>
    </div>
  );
}
