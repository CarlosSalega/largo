"use client";

// ---------------------------------------------------------------------------
// ProductStock — stock indicator + add-to-cart button wired to Zustand cart
// ---------------------------------------------------------------------------

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/features/cart/store";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ProductStockProps {
  stock: number;
  /** Product data required by the cart store */
  productId: string;
  slug: string;
  name: string;
  price: number; // already converted from Decimal
  currency: string;
  image: string | null;
}

type StockVariant = "in-stock" | "low-stock" | "out-of-stock";

interface StockStatus {
  label: string;
  variant: StockVariant;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getStockStatus(stock: number): StockStatus {
  if (stock === 0) return { label: "Sin stock", variant: "out-of-stock" };
  if (stock <= 10)
    return { label: `Solo quedan ${stock}`, variant: "low-stock" };
  return { label: "En stock", variant: "in-stock" };
}

const statusClasses: Record<StockVariant, { dot: string; text: string }> = {
  "in-stock": {
    dot: "bg-emerald-500",
    text: "text-emerald-600",
  },
  "low-stock": {
    dot: "bg-amber-500",
    text: "text-amber-600",
  },
  "out-of-stock": {
    dot: "bg-destructive",
    text: "text-destructive",
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ProductStock({ stock, productId, slug, name, price, currency, image }: ProductStockProps) {
  const addItem = useCartStore((s) => s.addItem);
  const clearCart = useCartStore((s) => s.clearCart);
  const toggleCart = useCartStore((s) => s.toggleCart);
  const [justAdded, setJustAdded] = useState(false);

  const { label, variant } = getStockStatus(stock);
  const classes = statusClasses[variant];
  const isOutOfStock = stock === 0;

  const handleAddToCart = useCallback(() => {
    if (isOutOfStock) return;

    const result = addItem({
      productId,
      slug,
      name,
      price,
      currency,
      image,
      stock,
    });

    if (result.success) {
      setJustAdded(true);
      toast.success("Agregado al carrito", {
        action: {
          label: "Ver carrito",
          onClick: () => toggleCart(),
        },
      });
      // Reset feedback state after animation
      setTimeout(() => setJustAdded(false), 1500);
    } else if (result.reason === "mixed-currency") {
      toast.error(
        `Tu carrito tiene productos en ${result.currentCurrency}. ¿Querés vaciarlo y agregar este en ${result.newCurrency}?`,
        {
          action: {
            label: "Vaciar y agregar",
            onClick: () => {
              clearCart();
              const retryResult = addItem({
                productId,
                slug,
                name,
                price,
                currency,
                image,
                stock,
              });
              if (retryResult.success) {
                toast.success(`Carrito vaciado — producto agregado en ${currency}`);
              }
            },
          },
        }
      );
    }
  }, [productId, slug, name, price, currency, image, stock, isOutOfStock, addItem, clearCart, toggleCart]);

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
      {/* Status indicator */}
      <div className="flex items-center gap-2.5">
        <span
          className={cn("inline-block h-2.5 w-2.5 rounded-full", classes.dot)}
          aria-hidden="true"
        />
        <span className={cn("text-sm font-medium", classes.text)}>
          {label}
        </span>
      </div>

      {/* Add to cart button */}
      <Button
        size="lg"
        className="w-full"
        disabled={isOutOfStock}
        onClick={handleAddToCart}
      >
        {justAdded ? (
          <>
            <ShoppingBag className="size-4" />
            ¡Agregado!
          </>
        ) : isOutOfStock ? (
          "Sin stock"
        ) : (
          "Agregar al carrito"
        )}
      </Button>
    </div>
  );
}
