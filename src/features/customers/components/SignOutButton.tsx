"use client";

import { authClient } from "@/lib/auth/client";

export function SignOutButton() {
  return (
    <form
      action={async () => {
        await authClient.signOut();
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
