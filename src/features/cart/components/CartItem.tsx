"use client";

// ---------------------------------------------------------------------------
// CartItem — single cart line with image, name, price, qty controls, remove
// ---------------------------------------------------------------------------

import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/formatPrice";
import { useCartStore } from "@/features/cart/store";
import type { CartItem as CartItemType } from "@/features/cart/types";

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  const lineSubtotal = item.price * item.quantity;
  const atMax = item.quantity >= item.stock;
  const atMin = item.quantity <= 1;

  return (
    <div className="flex gap-3 py-3 border-b border-border last:border-b-0">
      {/* Product image */}
      <div className="size-16 shrink-0 rounded-lg bg-muted overflow-hidden">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="size-full object-cover"
          />
        ) : (
          <div className="size-full flex items-center justify-center text-xs text-muted-foreground">
            No img
          </div>
        )}
      </div>

      {/* Info + controls */}
      <div className="flex-1 min-w-0 space-y-1">
        <p className="text-sm font-medium leading-tight truncate">
          {item.name}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatPrice(item.price, item.currency)}
        </p>

        {/* Quantity controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon-xs"
            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
            disabled={atMin}
            aria-label="Decrease quantity"
          >
            <Minus className="size-3" />
          </Button>
          <span className="w-7 text-center text-sm tabular-nums">
            {item.quantity}
          </span>
          <Button
            variant="outline"
            size="icon-xs"
            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
            disabled={atMax}
            aria-label="Increase quantity"
          >
            <Plus className="size-3" />
          </Button>
        </div>
      </div>

      {/* Subtotal + remove */}
      <div className="flex flex-col items-end justify-between">
        <span className="text-sm font-medium tabular-nums">
          {formatPrice(lineSubtotal, item.currency)}
        </span>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => removeItem(item.productId)}
          aria-label={`Remove ${item.name}`}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
