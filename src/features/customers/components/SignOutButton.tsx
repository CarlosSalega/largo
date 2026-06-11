"use client";

// ---------------------------------------------------------------------------
// SignOutButton — client component wrapping signOutAction in a form
// Redirects to home after sign-out to avoid stale "No autorizado" flash
// ---------------------------------------------------------------------------

import { useRouter } from "next/navigation";
import { signOutAction } from "@/features/customers/actions";

export function SignOutButton() {
  const router = useRouter();

  return (
    <form
      action={async () => {
        await signOutAction();
        router.push("/");
        router.refresh();
      }}
    >
      <button
        type="submit"
        className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
      >
        Salir
      </button>
    </form>
  );
}
