// ---------------------------------------------------------------------------
// Account layout — dashboard shell with sidebar navigation
// ---------------------------------------------------------------------------

import { headers } from "next/headers";
import Link from "next/link";
import { Package, User } from "lucide-react";
import { auth } from "@/lib/auth/config";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SignOutButton } from "@/features/customers/components/SignOutButton";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Edge case: session could be null if proxy.ts is bypassed or misconfigured
  if (!session) {
    return (
      <>
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-card-foreground">
              No autorizado
            </h1>
            <p className="mt-2 text-muted-foreground">
              Iniciá sesión para acceder a tu cuenta.
            </p>
            <Link
              href="/ingresar"
              className="mt-4 inline-block text-sm text-primary transition-colors hover:text-primary/80"
            >
              Ir a Ingresar
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="flex flex-1">
        {/* ---- Sidebar ---- */}
        <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-card">
          {/* User greeting */}
          <div className="border-b border-border px-6 py-6">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Cuenta
            </p>
            <p className="mt-1 text-base font-semibold text-card-foreground truncate">
              {session.user.name}
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
            <Link
              href="/account/orders"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-card-foreground transition-colors hover:bg-muted"
            >
              <Package />
              Mis órdenes
            </Link>
            <Link
              href="/account/profile"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-card-foreground transition-colors hover:bg-muted"
            >
              <User />
              Perfil
            </Link>
          </nav>

          {/* Sign out */}
          <div className="border-t border-border px-3 py-4">
            <SignOutButton />
          </div>
        </aside>

        {/* ---- Main content ---- */}
        <main className="min-w-0 flex-1 p-6 lg:p-8">{children}</main>
      </div>
      <Footer />
    </>
  );
}
