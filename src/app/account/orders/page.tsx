// ---------------------------------------------------------------------------
// Order history page — /account/orders
// ---------------------------------------------------------------------------

import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { ChevronRight, Package } from "lucide-react";
import { auth } from "@/lib/auth/config";
import { getCustomerOrders } from "@/features/customers/queries";
import { OrderStatusBadge } from "@/features/orders/components/OrderStatusBadge";
import { formatPrice } from "@/lib/formatPrice";
import { Button } from "@/components/ui/button";

// ---- metadata --------------------------------------------------------------

export const metadata: Metadata = {
  title: "Mis órdenes | Largo",
  description: "Historial de pedidos en Largo Store.",
  robots: { index: false, follow: false },
};

// ---- helpers ---------------------------------------------------------------

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
  }).format(date);
}

// ---- page ------------------------------------------------------------------

export default async function OrdersPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Defensive: proxy.ts should prevent this, but handle edge case
  if (!session) {
    return (
      <div className="py-16 text-center">
        <h2 className="text-xl font-bold text-card-foreground">
          No autorizado
        </h2>
        <p className="mt-2 text-muted-foreground">
          Iniciá sesión para ver tus órdenes.
        </p>
        <Link
          href="/ingresar"
          className="mt-4 inline-block text-sm text-primary transition-colors hover:text-primary/80"
        >
          Ir a Ingresar
        </Link>
      </div>
    );
  }

  const orders = await getCustomerOrders(session.user.id);

  // ---- Empty state ---------------------------------------------------------

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Package className="size-12 text-muted-foreground" />
        <h2 className="mt-4 text-xl font-bold text-card-foreground">
          Todavía no hiciste ningún pedido
        </h2>
        <p className="mt-2 text-muted-foreground">
          Explorá nuestro catálogo y hacé tu primer pedido.
        </p>
        <Button variant="default" size="sm" className="mt-6" asChild>
          <Link href="/catalog">Ver catálogo</Link>
        </Button>
      </div>
    );
  }

  // ---- Order list ----------------------------------------------------------

  return (
    <div>
      <h1 className="text-2xl font-bold text-card-foreground">Mis órdenes</h1>

      <div className="mt-6 flex flex-col gap-3">
        {orders.map((order) => (
          <Link
            key={order.id}
            href={`/account/orders/${order.orderNumber}`}
            className="group flex items-center gap-4 rounded-lg border border-border bg-card px-5 py-4 transition-colors hover:bg-muted/50"
          >
            <div className="flex flex-1 items-center gap-4 min-w-0">
              <div className="shrink-0">
                <p className="font-mono text-sm font-semibold text-card-foreground">
                  #{order.orderNumber}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {formatDate(order.createdAt)}
                </p>
              </div>
              <div className="flex flex-1 items-center justify-end gap-4">
                <OrderStatusBadge status={order.status} />
                <span className="text-sm font-semibold text-card-foreground tabular-nums">
                  {formatPrice(order.total, order.payment?.currency ?? "ARS")}
                </span>
              </div>
            </div>
            <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </Link>
        ))}
      </div>
    </div>
  );
}
