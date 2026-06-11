"use client";

// ---------------------------------------------------------------------------
// SidebarToggle — collapsible admin sidebar with smooth CSS transition
// Renders the full sidebar + main content area. Collapsed state is
// persisted in client memory (useState) — collapses to icon-only view.
// ---------------------------------------------------------------------------

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  PanelLeftClose,
  PanelLeft,
  Package,
  Tags,
  ClipboardList,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { SignOutButton } from "@/features/customers/components/SignOutButton";

// ── Navigation items ─────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { href: "/admin/products", label: "Productos", icon: Package },
  { href: "/admin/categories", label: "Categorías", icon: Tags },
  { href: "/admin/orders", label: "Órdenes", icon: ClipboardList },
] as const;

// ── Types ────────────────────────────────────────────────────────────────────

interface SidebarToggleProps {
  userName: string;
  children: React.ReactNode;
}

// ── Component ────────────────────────────────────────────────────────────────

export function SidebarToggle({ userName, children }: SidebarToggleProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  // Auto-collapse on mobile (window width < 768px)
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 768) {
        setCollapsed(true);
      }
    }

    // Check on mount
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex min-h-screen bg-background">
      {/* ── Sidebar ────────────────────────────────────────────────────── */}
      <aside
        className={cn(
          "flex shrink-0 flex-col border-r border-border bg-card transition-all duration-300 ease-in-out",
          collapsed ? "w-16" : "w-64",
        )}
      >
        {/* Brand / Toggle row */}
        <div
          className={cn(
            "flex items-center border-b border-border px-4 py-4",
            collapsed ? "justify-center" : "justify-between",
          )}
        >
          {!collapsed && (
            <Link
              href="/admin"
              className="text-xl font-bold tracking-tight text-card-foreground transition-opacity hover:opacity-80"
            >
              LARGO
            </Link>
          )}
          <button
            type="button"
            onClick={() => setCollapsed((prev) => !prev)}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-card-foreground"
            aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
          >
            {collapsed ? (
              <PanelLeft className="size-5" />
            ) : (
              <PanelLeftClose className="size-5" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-2 py-4">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  collapsed && "justify-center",
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-card-foreground hover:bg-muted",
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="size-4 shrink-0" />
                {!collapsed && (
                  <span className="truncate">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div
          className={cn(
            "border-t border-border px-4 py-4",
            collapsed && "px-2",
          )}
        >
          {!collapsed && (
            <p className="mb-2 px-1 text-sm text-muted-foreground">
              Hola,{" "}
              <span className="font-medium text-card-foreground">
                {userName}
              </span>
            </p>
          )}
          <div className={collapsed ? "flex justify-center" : ""}>
            <SignOutButton />
          </div>
        </div>
      </aside>

      {/* ── Main content ────────────────────────────────────────────────── */}
      <main className="min-w-0 flex-1 p-6">{children}</main>
    </div>
  );
}
