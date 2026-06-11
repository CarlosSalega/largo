"use client";

// ---------------------------------------------------------------------------
// CustomerStep — step 1: name, email, phone
// ---------------------------------------------------------------------------

import { useFormContext } from "react-hook-form";
import type { CheckoutFormData } from "../types";

interface CustomerStepProps {
  onNext: () => void;
}

export function CustomerStep({ onNext }: CustomerStepProps) {
  const {
    register,
    trigger,
    formState: { errors },
  } = useFormContext<CheckoutFormData>();

  const handleContinue = async () => {
    const valid = await trigger(["name", "email", "phone"]);
    if (valid) onNext();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white">
        Datos personales
      </h2>

      {/* Nombre */}
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-300">
          Nombre completo
        </label>
        <input
          id="name"
          type="text"
          placeholder="Tu nombre completo"
          {...register("name")}
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-300">
          Correo electrónico
        </label>
        <input
          id="email"
          type="email"
          placeholder="tu@email.com"
          {...register("email")}
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
        )}
      </div>

      {/* Teléfono */}
      <div>
        <label htmlFor="phone" className="mb-1 block text-sm font-medium text-slate-300">
          Teléfono (opcional)
        </label>
        <input
          id="phone"
          type="tel"
          placeholder="+54 11 1234-5678"
          {...register("phone")}
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-red-400">{errors.phone.message}</p>
        )}
      </div>

      {/* Continuar */}
      <button
        type="button"
        onClick={handleContinue}
        className="w-full rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
      >
        Continuar
      </button>
    </div>
  );
}
