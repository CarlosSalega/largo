// ---------------------------------------------------------------------------
// Account layout — dashboard shell with sidebar navigation
// ---------------------------------------------------------------------------

import { headers } from "next/headers";
import Link from "next/link";
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
            <h1 className="text-2xl font-bold text-white">No autorizado</h1>
            <p className="mt-2 text-slate-400">
              Iniciá sesión para acceder a tu cuenta.
            </p>
            <Link
              href="/ingresar"
              className="mt-4 inline-block text-sm text-blue-400 transition-colors hover:text-blue-300"
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
        <aside className="w-64 shrink-0 border-r border-slate-800 bg-slate-900/50 p-6">
          {/* User greeting */}
          <div className="mb-8">
            <p className="text-sm text-slate-400">Hola,</p>
            <p className="text-lg font-semibold text-white">
              {session.user.name}
            </p>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            <Link
              href="/account/orders"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
            >
              Mis órdenes
            </Link>
            <Link
              href="/account/profile"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
            >
              Perfil
            </Link>
          </nav>

          {/* Sign out */}
          <div className="mt-8">
            <SignOutButton />
          </div>
        </aside>

        {/* ---- Main content ---- */}
        <main className="min-w-0 flex-1 p-6">{children}</main>
      </div>
      <Footer />
    </>
  );
}
