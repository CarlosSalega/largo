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
        className="w-full rounded-lg px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-card-foreground"
      >
        Salir
      </button>
    </form>
  );
}
