import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/config";
import { Navigation } from "@/components/layout/Navigation";
import { CartIcon } from "@/features/cart/components/CartIcon";
import { HeaderAuth } from "@/components/layout/HeaderAuth";

export async function Header() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight transition-opacity hover:opacity-80"
        >
          LARGO
        </Link>
        <div className="flex items-center gap-2">
          <Navigation />
          <HeaderAuth authenticated={!!session} />
          <CartIcon />
        </div>
      </div>
    </header>
  );
}
