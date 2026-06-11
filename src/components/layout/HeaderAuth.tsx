"use client";

// ---------------------------------------------------------------------------
// HeaderAuth — auth-aware section for the site header
// Renders "Ingresar" (guest) or "Mi cuenta" + "Salir" (authenticated)
// ---------------------------------------------------------------------------

import { useRouter } from "next/navigation";
import Link from "next/link";
import { signOutAction } from "@/features/customers/actions";

interface HeaderAuthProps {
  authenticated: boolean;
}

export function HeaderAuth({ authenticated }: HeaderAuthProps) {
  const router = useRouter();

  if (!authenticated) {
    return (
      <Link
        href="/ingresar"
        className="text-sm text-slate-300 transition-colors hover:text-white"
      >
        Ingresar
      </Link>
    );
  }

  async function handleSignOut() {
    await signOutAction();
    router.push("/");
    router.refresh();
  }

  return (
    <>
      <Link
        href="/account"
        className="text-sm text-slate-300 transition-colors hover:text-white"
      >
        Mi cuenta
      </Link>
      <form action={handleSignOut}>
        <button
          type="submit"
          className="text-sm text-slate-400 transition-colors hover:text-white"
        >
          Salir
        </button>
      </form>
    </>
  );
}
