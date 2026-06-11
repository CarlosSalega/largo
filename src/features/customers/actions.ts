"use server";

// ---------------------------------------------------------------------------
// Customer auth Server Actions — sign-in, sign-up, sign-out
// ---------------------------------------------------------------------------

import { auth } from "@/lib/auth/config";
import type { SignInInput, SignUpInput } from "@/features/customers/schemas";

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
