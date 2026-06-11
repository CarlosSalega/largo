// ---------------------------------------------------------------------------
// Admin layout — full-screen dashboard shell with sidebar navigation
// Defense-in-depth: RSC session check (proxy.ts is the primary gate)
// ---------------------------------------------------------------------------

import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/lib/auth/config";
import { SignOutButton } from "@/features/customers/components/SignOutButton";

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
    <div className="flex min-h-screen bg-background">
      {/* ---- Sidebar ---- */}
      <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-card">
        {/* Brand */}
        <div className="border-b border-border px-6 py-5">
          <Link
            href="/admin"
            className="text-xl font-bold tracking-tight text-card-foreground transition-opacity hover:opacity-80"
          >
            LARGO
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-4 py-4">
          <Link
            href="/admin/products"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-card-foreground transition-colors hover:bg-muted"
          >
            Productos
          </Link>
          <Link
            href="/admin/categories"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-card-foreground transition-colors hover:bg-muted"
          >
            Categorías
          </Link>
          <Link
            href="/admin/orders"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-card-foreground transition-colors hover:bg-muted"
          >
            Órdenes
          </Link>
        </nav>

        {/* User section */}
        <div className="border-t border-border px-4 py-4">
          <p className="px-3 text-sm text-muted-foreground">
            Hola,{" "}
            <span className="font-medium text-card-foreground">
              {session.user.name}
            </span>
          </p>
          <div className="mt-2">
            <SignOutButton />
          </div>
        </div>
      </aside>

      {/* ---- Main content ---- */}
      <main className="min-w-0 flex-1 p-6">{children}</main>
    </div>
  );
}
