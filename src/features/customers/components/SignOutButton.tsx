"use client";

// ---------------------------------------------------------------------------
// SignOutButton — client component wrapping signOutAction in a form
// Uses window.location.href for full reload with cookie clearing
// ---------------------------------------------------------------------------

import { signOutAction } from "@/features/customers/actions";

export function SignOutButton() {
  return (
    <form
      action={async () => {
        await signOutAction();
        window.location.href = "/";
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
