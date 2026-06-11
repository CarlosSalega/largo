"use client";

// ---------------------------------------------------------------------------
// ReviewStep — step 3: customer info + shipping summary + order summary
// ---------------------------------------------------------------------------

import { useFormContext } from "react-hook-form";
import { useCartStore } from "@/features/cart/store";
import { formatPrice } from "@/lib/formatPrice";
import { OrderSummary } from "./OrderSummary";
import type { CheckoutFormData } from "../types";

interface ReviewStepProps {
  onBack: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
  errorMessage?: string | null;
}

export function ReviewStep({
  onBack,
  onConfirm,
  isSubmitting,
  errorMessage,
}: ReviewStepProps) {
  const { getValues } = useFormContext<CheckoutFormData>();
  const currency = useCartStore((s) => s.getCurrency()) ?? "ARS";
  const subtotal = useCartStore((s) => s.getSubtotal());
  const values = getValues();

  return (
    <div className="space-y-8">
      {/* Customer info summary */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Datos personales
        </h3>
        <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 text-sm">
          <p className="text-white">{values.name}</p>
          <p className="mt-1 text-slate-300">{values.email}</p>
          {values.phone && (
            <p className="mt-1 text-slate-300">{values.phone}</p>
          )}
        </div>
      </div>

      {/* Shipping address summary */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Dirección de envío
        </h3>
        <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 text-sm">
          <p className="text-white">{values.street}</p>
          <p className="mt-1 text-slate-300">
            {values.city}, {values.state}
          </p>
          <p className="mt-1 text-slate-300">
            CP {values.zipCode} — {values.country}
          </p>
        </div>
      </div>

      {/* Order total summary */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Total
        </h3>
        <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
          <p className="text-lg font-bold text-white">
            {formatPrice(subtotal, currency)}
          </p>
        </div>
      </div>

      {/* Order item list + confirm */}
      <OrderSummary
        onConfirm={onConfirm}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
      />

      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        className="w-full rounded-lg border border-slate-600 px-6 py-3 font-medium text-slate-300 transition-colors hover:bg-slate-800"
      >
        Volver
      </button>
    </div>
  );
}
