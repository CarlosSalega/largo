"use client";

// ---------------------------------------------------------------------------
// HeaderAuth — auth-aware section for the site header
// Guest: "Ingresar" outline button CTA
// Authenticated: avatar circle → DropdownMenu with account links + sign out
// ---------------------------------------------------------------------------

import Link from "next/link";
import { User, Shield, LogOut } from "lucide-react";
import { authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderAuthProps {
  authenticated: boolean;
  userName?: string;
  role?: string;
}

export function HeaderAuth({ authenticated, userName, role }: HeaderAuthProps) {
  if (!authenticated) {
    return (
      <Button variant="outline" size="sm" asChild>
        <Link href="/ingresar">Ingresar</Link>
      </Button>
    );
  }

  const initial = userName?.charAt(0).toUpperCase() ?? "";

  async function handleSignOut() {
    await authClient.signOut();
    window.location.href = "/";
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="Menú de usuario"
        >
          {initial || <User />}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/account">
              <User />
              Mi cuenta
            </Link>
          </DropdownMenuItem>
          {role === "ADMIN" && (
            <DropdownMenuItem asChild>
              <Link href="/admin">
                <Shield />
                Admin
              </Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem variant="destructive" onSelect={handleSignOut}>
            <LogOut />
            Salir
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
