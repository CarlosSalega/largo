"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/", label: "Home" },
  { href: "/catalog", label: "Products" },
  { href: "/catalog", label: "Categories" },
  { href: "/catalog", label: "Brands" },
];

export function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop navigation */}
      <nav className="hidden md:flex items-center gap-8">
        {links.map((link) => (
          <Link
            key={`${link.href}-${link.label}`}
            href={link.href}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Mobile menu toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation menu"
      >
        <Menu className="size-5" />
      </Button>

      {/* Mobile navigation overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed right-0 top-0 h-full w-64 bg-background shadow-xl p-6 animate-in slide-in-from-right">
            <div className="flex items-center justify-between mb-8">
              <span className="text-lg font-bold">Menu</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation menu"
              >
                <X className="size-5" />
              </Button>
            </div>
            <nav className="flex flex-col gap-4">
              {links.map((link) => (
                <Link
                  key={`mobile-${link.href}-${link.label}`}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-base font-medium text-foreground transition-colors hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
