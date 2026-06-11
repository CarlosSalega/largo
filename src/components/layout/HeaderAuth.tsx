"use client";

// ---------------------------------------------------------------------------
// HeaderAuth — auth-aware section for the site header
// Renders "Ingresar" (guest) or "Mi cuenta" + "Salir" (authenticated)
// ---------------------------------------------------------------------------

import Link from "next/link";
import { signOutAction } from "@/features/customers/actions";

interface HeaderAuthProps {
  authenticated: boolean;
  role?: string;
}

export function HeaderAuth({ authenticated, role }: HeaderAuthProps) {
  if (!authenticated) {
    return (
      <Link
        href="/ingresar"
        className="text-sm text-card-foreground transition-colors hover:text-card-foreground"
      >
        Ingresar
      </Link>
    );
  }

  async function handleSignOut() {
    await signOutAction();
    window.location.href = "/";
  }

  return (
    <>
      {role === "ADMIN" && (
        <Link
          href="/admin"
          className="text-sm text-card-foreground transition-colors hover:text-card-foreground"
        >
          Admin
        </Link>
      )}
      <Link
        href="/account"
        className="text-sm text-card-foreground transition-colors hover:text-card-foreground"
      >
        Mi cuenta
      </Link>
      <form action={handleSignOut}>
        <button
          type="submit"
          className="text-sm text-muted-foreground transition-colors hover:text-card-foreground"
        >
          Salir
        </button>
      </form>
    </>
  );
}
