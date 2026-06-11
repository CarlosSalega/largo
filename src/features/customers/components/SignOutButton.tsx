"use client";

// ---------------------------------------------------------------------------
// SignOutButton — client component wrapping signOutAction in a form
// ---------------------------------------------------------------------------

import { signOutAction } from "@/features/customers/actions";

export function SignOutButton() {
  return (
    <form
      action={async () => {
        await signOutAction();
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
