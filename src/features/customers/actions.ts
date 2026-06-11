"use server";

// ---------------------------------------------------------------------------
// Customer Server Actions — sign-in, sign-up, sign-out, profile, password
// ---------------------------------------------------------------------------

import { auth } from "@/lib/auth/config";
import type {
  SignInInput,
  SignUpInput,
  ProfileInput,
  PasswordInput,
} from "@/features/customers/schemas";

function defaultName(email: string): string {
  return email.split("@")[0] ?? "Usuario";
}

// ---- signUpAction ----------------------------------------------------------

export async function signUpAction(data: SignUpInput) {
  const { email, password } = data;

  try {
    await auth.api.signUpEmail({
      body: {
        email,
        password,
        name: defaultName(email),
      },
    });

    return { success: true as const };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message.toLowerCase() : String(err);

    if (message.includes("already exists") || message.includes("already registered")) {
      return { error: "El email ya está registrado" };
    }

    return { error: "Error al crear la cuenta. Intentá de nuevo." };
  }
}

// ---- signInAction -----------------------------------------------------------

export async function signInAction(data: SignInInput) {
  const { email, password } = data;

  try {
    await auth.api.signInEmail({
      body: { email, password },
    });

    return { success: true as const };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message.toLowerCase() : String(err);

    if (
      message.includes("invalid") ||
      message.includes("incorrect") ||
      message.includes("wrong") ||
      message.includes("not found")
    ) {
      return { error: "Email o contraseña incorrectos" };
    }

    return { error: "Error al iniciar sesión. Intentá de nuevo." };
  }
}

// ---- signOutAction ----------------------------------------------------------

export async function signOutAction() {
  try {
    const { headers } = await import("next/headers");
    await auth.api.signOut({
      headers: await headers(),
    });

    return { success: true as const };
  } catch {
    return { error: "Error al cerrar sesión" };
  }
}

// ---- updateProfileAction ----------------------------------------------------

export async function updateProfileAction(data: ProfileInput) {
  const { headers } = await import("next/headers");

  try {
    await auth.api.updateUser({
      headers: await headers(),
      body: { name: data.name },
    });

    return { success: true as const };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message.toLowerCase() : String(err);

    if (message.includes("unauthorized") || message.includes("session")) {
      return { error: "Sesión expirada. Volvé a iniciar sesión." };
    }

    return { error: "Error al actualizar el perfil. Intentá de nuevo." };
  }
}

// ---- changePasswordAction ---------------------------------------------------

export async function changePasswordAction(data: PasswordInput) {
  const { headers } = await import("next/headers");

  try {
    await auth.api.changePassword({
      headers: await headers(),
      body: {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        revokeOtherSessions: false,
      },
    });

    return { success: true as const };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message.toLowerCase() : String(err);

    if (message.includes("invalid") || message.includes("incorrect")) {
      return { error: "La contraseña actual es incorrecta" };
    }

    if (message.includes("unauthorized") || message.includes("session")) {
      return { error: "Sesión expirada. Volvé a iniciar sesión." };
    }

    return { error: "Error al cambiar la contraseña. Intentá de nuevo." };
  }
}
