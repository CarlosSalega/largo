// ---------------------------------------------------------------------------
// Admin layout — full-screen dashboard shell with collapsible sidebar navigation
// Defense-in-depth: RSC session check (proxy.ts is the primary gate)
// Sidebar state is client-side (SidebarToggle) — collapsed on mobile by default
// ---------------------------------------------------------------------------

import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/lib/auth/config";
import { SidebarToggle } from "@/components/admin/SidebarToggle";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Defense-in-depth: double-check session + role in case proxy.ts is bypassed
  if (!session || session.user.role !== "ADMIN") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-card-foreground">
            No autorizado
          </h1>
          <p className="mt-2 text-muted-foreground">
            No tenés permisos para acceder al panel de administración.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block text-sm text-primary transition-colors hover:text-primary/80"
          >
            Volver al inicio
          </Link>
        </div>
      </main>
    );
  }

  return (
    <SidebarToggle userName={session.user.name}>{children}</SidebarToggle>
  );
}
