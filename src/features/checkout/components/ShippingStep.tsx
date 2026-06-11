"use client";

// ---------------------------------------------------------------------------
// ShippingStep — step 2: street, city, state, zip code, country
// ---------------------------------------------------------------------------

import { useFormContext } from "react-hook-form";
import type { CheckoutFormData } from "../types";

interface ShippingStepProps {
  onNext: () => void;
  onBack: () => void;
}

export function ShippingStep({ onNext, onBack }: ShippingStepProps) {
  const {
    register,
    trigger,
    formState: { errors },
  } = useFormContext<CheckoutFormData>();

  const handleContinue = async () => {
    const valid = await trigger(["street", "city", "state", "zipCode", "country"]);
    if (valid) onNext();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white">
        Dirección de envío
      </h2>

      {/* Calle */}
      <div>
        <label htmlFor="street" className="mb-1 block text-sm font-medium text-slate-300">
          Dirección
        </label>
        <input
          id="street"
          type="text"
          placeholder="Calle y número"
          {...register("street")}
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
        />
        {errors.street && (
          <p className="mt-1 text-sm text-red-400">{errors.street.message}</p>
        )}
      </div>

      {/* Ciudad y Provincia */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="city" className="mb-1 block text-sm font-medium text-slate-300">
            Ciudad
          </label>
          <input
            id="city"
            type="text"
            placeholder="Ciudad"
            {...register("city")}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
          />
          {errors.city && (
            <p className="mt-1 text-sm text-red-400">{errors.city.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="state" className="mb-1 block text-sm font-medium text-slate-300">
            Provincia
          </label>
          <input
            id="state"
            type="text"
            placeholder="Provincia"
            {...register("state")}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
          />
          {errors.state && (
            <p className="mt-1 text-sm text-red-400">{errors.state.message}</p>
          )}
        </div>
      </div>

      {/* Código postal y País */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="zipCode" className="mb-1 block text-sm font-medium text-slate-300">
            Código postal
          </label>
          <input
            id="zipCode"
            type="text"
            placeholder="Código postal"
            {...register("zipCode")}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
          />
          {errors.zipCode && (
            <p className="mt-1 text-sm text-red-400">{errors.zipCode.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="country" className="mb-1 block text-sm font-medium text-slate-300">
            País
          </label>
          <input
            id="country"
            type="text"
            defaultValue="Argentina"
            {...register("country")}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
          />
          {errors.country && (
            <p className="mt-1 text-sm text-red-400">{errors.country.message}</p>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 rounded-lg border border-slate-600 px-6 py-3 font-medium text-slate-300 transition-colors hover:bg-slate-800"
        >
          Volver
        </button>
        <button
          type="button"
          onClick={handleContinue}
          className="flex-1 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
