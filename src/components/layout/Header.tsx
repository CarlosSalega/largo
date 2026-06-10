import Link from "next/link";
import { Navigation } from "@/components/layout/Navigation";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight transition-opacity hover:opacity-80"
        >
          LARGO
        </Link>
        <Navigation />
      </div>
    </header>
  );
}
