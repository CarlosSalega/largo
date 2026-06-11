"use client";

// ---------------------------------------------------------------------------
// OrderSummary — read-only cart items with totals (review step)
// ---------------------------------------------------------------------------

import { useCartStore } from "@/features/cart/store";
import { formatPrice } from "@/lib/formatPrice";

interface OrderSummaryProps {
  onConfirm: () => void;
  isSubmitting: boolean;
  errorMessage?: string | null;
}

export function OrderSummary({
  onConfirm,
  isSubmitting,
  errorMessage,
}: OrderSummaryProps) {
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.getSubtotal());
  const currency = useCartStore((s) => s.getCurrency()) ?? "ARS";

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white">
        Resumen del pedido
      </h2>

      {/* Item list */}
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.productId}
            className="flex items-start justify-between rounded-lg border border-slate-700 bg-slate-800/50 p-4"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white">{item.name}</p>
              <p className="mt-1 text-sm text-slate-400">
                {item.quantity} × {formatPrice(item.price, item.currency)}
              </p>
            </div>
            <p className="ml-4 text-sm font-semibold text-white">
              {formatPrice(item.price * item.quantity, item.currency)}
            </p>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="flex items-center justify-between border-t border-slate-700 pt-4">
        <span className="text-lg font-medium text-slate-300">Total</span>
        <span className="text-lg font-bold text-white">
          {formatPrice(subtotal, currency)}
        </span>
      </div>

      {/* Error message */}
      {errorMessage && (
        <div className="rounded-lg bg-red-900/30 border border-red-700 p-3">
          <p className="text-sm text-red-300">{errorMessage}</p>
        </div>
      )}

      {/* Confirm button */}
      <button
        type="button"
        onClick={onConfirm}
        disabled={isSubmitting}
        className="w-full rounded-lg bg-green-600 px-6 py-3 font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="h-5 w-5 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Procesando...
          </span>
        ) : (
          "Confirmar pedido"
        )}
      </button>
    </div>
  );
}
