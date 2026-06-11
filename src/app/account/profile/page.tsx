"use client";

// ---------------------------------------------------------------------------
// Profile page — update name and change password
// Follows the ingresar form pattern: RHF + zodResolver, min-h-[1.5rem]
// error space, sonner toasts, disabled/pending submit buttons
// ---------------------------------------------------------------------------

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { authClient } from "@/lib/auth/client";
import {
  profileSchema,
  passwordSchema,
  type ProfileInput,
  type PasswordInput,
} from "@/features/customers/schemas";
import {
  updateProfileAction,
  changePasswordAction,
} from "@/features/customers/actions";

export default function ProfilePage() {
  const { data: session, isPending: sessionLoading } = authClient.useSession();

  // ---- Name form ----------------------------------------------------------
  const {
    register: registerName,
    handleSubmit: handleNameSubmit,
    reset: resetNameForm,
    formState: { errors: nameErrors, isSubmitting: namePending },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema) as unknown as Resolver<ProfileInput>,
    defaultValues: { name: "" },
  });

  // ---- Password form ------------------------------------------------------
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors, isSubmitting: passwordPending },
  } = useForm<PasswordInput>({
    resolver: zodResolver(passwordSchema) as unknown as Resolver<PasswordInput>,
  });

  // Fill default name when session loads
  useEffect(() => {
    if (session?.user?.name) {
      resetNameForm({ name: session.user.name });
    }
  }, [session?.user?.name, resetNameForm]);

  // ---- Name submit handler ------------------------------------------------
  async function onNameSubmit(data: ProfileInput) {
    try {
      const result = await updateProfileAction(data);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Nombre actualizado");
      }
    } catch {
      toast.error("Error de conexión. Intentá de nuevo.");
    }
  }

  // ---- Password submit handler --------------------------------------------
  async function onPasswordSubmit(data: PasswordInput) {
    try {
      const result = await changePasswordAction(data);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Contraseña actualizada");
        resetPasswordForm();
      }
    } catch {
      toast.error("Error de conexión. Intentá de nuevo.");
    }
  }

  // ---- Pending state ------------------------------------------------------
  const isPending = sessionLoading;

  return (
    <div className="mx-auto max-w-lg space-y-10">
      <h1 className="text-2xl font-bold text-white">Perfil</h1>

      {/* ================================================================= */}
      {/* Name section                                                      */}
      {/* ================================================================= */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-white">Nombre</h2>

        <form onSubmit={handleNameSubmit(onNameSubmit)} className="space-y-4">
          <div>
            <label
              htmlFor="profile-name"
              className="mb-1 block text-sm font-medium text-slate-300"
            >
              Tu nombre
            </label>
            <input
              id="profile-name"
              type="text"
              placeholder="Tu nombre completo"
              disabled={isPending}
              {...registerName("name")}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none disabled:opacity-50"
            />
            <p className="min-h-[1.5rem] text-sm text-red-400">
              {nameErrors.name?.message ?? "\u00A0"}
            </p>
          </div>

          <button
            type="submit"
            disabled={namePending || isPending}
            className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {namePending ? "Guardando..." : "Guardar cambios"}
          </button>
        </form>
      </section>

      {/* ================================================================= */}
      {/* Password section                                                  */}
      {/* ================================================================= */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-white">
          Cambiar contraseña
        </h2>

        <form
          onSubmit={handlePasswordSubmit(onPasswordSubmit)}
          className="space-y-4"
        >
          {/* Current password */}
          <div>
            <label
              htmlFor="profile-current-password"
              className="mb-1 block text-sm font-medium text-slate-300"
            >
              Contraseña actual
            </label>
            <input
              id="profile-current-password"
              type="password"
              placeholder="Tu contraseña actual"
              autoComplete="current-password"
              {...registerPassword("currentPassword")}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
            />
            <p className="min-h-[1.5rem] text-sm text-red-400">
              {passwordErrors.currentPassword?.message ?? "\u00A0"}
            </p>
          </div>

          {/* New password */}
          <div>
            <label
              htmlFor="profile-new-password"
              className="mb-1 block text-sm font-medium text-slate-300"
            >
              Nueva contraseña
            </label>
            <input
              id="profile-new-password"
              type="password"
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
              {...registerPassword("newPassword")}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
            />
            <p className="min-h-[1.5rem] text-sm text-red-400">
              {passwordErrors.newPassword?.message ?? "\u00A0"}
            </p>
          </div>

          <button
            type="submit"
            disabled={passwordPending}
            className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {passwordPending ? "Guardando..." : "Cambiar contraseña"}
          </button>
        </form>
      </section>
    </div>
  );
}
