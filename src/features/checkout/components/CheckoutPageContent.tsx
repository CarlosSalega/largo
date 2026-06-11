"use client";

// ---------------------------------------------------------------------------
// CheckoutPageContent — client wrapper: empty cart guard → CheckoutForm
// ---------------------------------------------------------------------------

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/features/cart/store";
import { CheckoutForm } from "./CheckoutForm";
import { toast } from "sonner";

export function CheckoutPageContent() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const hasHydrated = useCartStore((s) => s.hasHydrated);

  useEffect(() => {
    if (!hasHydrated) return;

    if (items.length === 0) {
      toast.error("Agregá productos al carrito antes de continuar");
      router.replace("/cart");
    }
  }, [hasHydrated, items.length, router]);

  // Show nothing while hydrating or redirecting
  if (!hasHydrated) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-600 border-t-blue-500" />
      </div>
    );
  }

  if (items.length === 0) {
    return null; // redirect in effect
  }

  return (
    <div className="py-12">
      <h1 className="mb-10 text-center text-3xl font-bold text-white">
        Finalizar compra
      </h1>
      <CheckoutForm />
    </div>
  );
}
