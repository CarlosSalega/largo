"use client";

// ---------------------------------------------------------------------------
// Ingresar page — Sign In / Sign Up toggle
// ---------------------------------------------------------------------------

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  signInSchema,
  type SignInInput,
} from "@/features/customers/schemas";
import { signInAction, signUpAction } from "@/features/customers/actions";

type AuthMode = "signin" | "signup";

export default function IngresarPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [pending, setPending] = useState(false);

  const {
    register,
    handleSubmit,
    clearErrors,
    formState: { errors },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema) as unknown as Resolver<SignInInput>,
  });

  // Clear validation state when switching modes
  useEffect(() => {
    clearErrors();
  }, [mode, clearErrors]);

  async function onSubmit(data: SignInInput) {
    setPending(true);
    try {
      const action = mode === "signin" ? signInAction : signUpAction;
      const result = await action(data);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("¡Bienvenido!");
        router.push("/account");
      }
    } catch {
      toast.error("Error de conexión. Intentá de nuevo.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 sm:p-8">
      <h1 className="mb-6 text-center text-2xl font-bold text-white">
        {mode === "signin" ? "Iniciar sesión" : "Crear cuenta"}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="mb-1 block text-sm font-medium text-slate-300"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="tu@email.com"
            autoComplete="email"
            {...register("email")}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
          />
          <p className="min-h-[1.5rem] text-sm text-red-400">
            {errors.email?.message ?? "\u00A0"}
          </p>
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="mb-1 block text-sm font-medium text-slate-300"
          >
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            placeholder="Mínimo 8 caracteres"
            autoComplete={
              mode === "signin" ? "current-password" : "new-password"
            }
            {...register("password")}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
          />
          <p className="min-h-[1.5rem] text-sm text-red-400">
            {errors.password?.message ?? "\u00A0"}
          </p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending
            ? "Procesando..."
            : mode === "signin"
              ? "Ingresar"
              : "Crear cuenta"}
        </button>
      </form>

      {/* Toggle */}
      <p className="mt-4 text-center text-sm text-slate-400">
        {mode === "signin" ? (
          <>
            ¿No tenés cuenta?{" "}
            <button
              type="button"
              onClick={() => setMode("signup")}
              className="font-medium text-blue-400 transition-colors hover:text-blue-300"
            >
              Creá una
            </button>
          </>
        ) : (
          <>
            ¿Ya tenés cuenta?{" "}
            <button
              type="button"
              onClick={() => setMode("signin")}
              className="font-medium text-blue-400 transition-colors hover:text-blue-300"
            >
              Iniciar sesión
            </button>
          </>
        )}
      </p>
    </div>
  );
}
