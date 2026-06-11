"use client";

// ---------------------------------------------------------------------------
// RequireAdmin — client wrapper that redirects non-ADMIN users
// Fallback guard for client components that bypass server-side checks
// ---------------------------------------------------------------------------

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface RequireAdminProps {
  isAdmin: boolean;
  children: React.ReactNode;
}

export function RequireAdmin({ isAdmin, children }: RequireAdminProps) {
  const router = useRouter();

  useEffect(() => {
    if (!isAdmin) {
      router.push("/ingresar");
    }
  }, [isAdmin, router]);

  if (!isAdmin) {
    return null;
  }

  return <>{children}</>;
}
