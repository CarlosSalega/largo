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
      <h1 className="text-2xl font-bold text-card-foreground">Perfil</h1>

      {/* ================================================================= */}
      {/* Name section                                                      */}
      {/* ================================================================= */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-card-foreground">Nombre</h2>

        <form onSubmit={handleNameSubmit(onNameSubmit)} className="space-y-4">
          <div>
            <label
              htmlFor="profile-name"
              className="mb-1 block text-sm font-medium text-card-foreground"
            >
              Tu nombre
            </label>
            <input
              id="profile-name"
              type="text"
              placeholder="Tu nombre completo"
              disabled={isPending}
              {...registerName("name")}
              className="w-full rounded-lg border border-input bg-muted px-4 py-2.5 text-card-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none disabled:opacity-50"
            />
            <p className="min-h-[1.5rem] text-sm text-destructive">
              {nameErrors.name?.message ?? "\u00A0"}
            </p>
          </div>

          <button
            type="submit"
            disabled={namePending || isPending}
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-card-foreground transition-colors hover:bg-primary/80 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {namePending ? "Guardando..." : "Guardar cambios"}
          </button>
        </form>
      </section>

      {/* ================================================================= */}
      {/* Password section                                                  */}
      {/* ================================================================= */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-card-foreground">
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
              className="mb-1 block text-sm font-medium text-card-foreground"
            >
              Contraseña actual
            </label>
            <input
              id="profile-current-password"
              type="password"
              placeholder="Tu contraseña actual"
              autoComplete="current-password"
              {...registerPassword("currentPassword")}
              className="w-full rounded-lg border border-input bg-muted px-4 py-2.5 text-card-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
            />
            <p className="min-h-[1.5rem] text-sm text-destructive">
              {passwordErrors.currentPassword?.message ?? "\u00A0"}
            </p>
          </div>

          {/* New password */}
          <div>
            <label
              htmlFor="profile-new-password"
              className="mb-1 block text-sm font-medium text-card-foreground"
            >
              Nueva contraseña
            </label>
            <input
              id="profile-new-password"
              type="password"
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
              {...registerPassword("newPassword")}
              className="w-full rounded-lg border border-input bg-muted px-4 py-2.5 text-card-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
            />
            <p className="min-h-[1.5rem] text-sm text-destructive">
              {passwordErrors.newPassword?.message ?? "\u00A0"}
            </p>
          </div>

          <button
            type="submit"
            disabled={passwordPending}
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-card-foreground transition-colors hover:bg-primary/80 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {passwordPending ? "Guardando..." : "Cambiar contraseña"}
          </button>
        </form>
      </section>
    </div>
  );
}
