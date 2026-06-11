// ---------------------------------------------------------------------------
// Order history page — /account/orders
// ---------------------------------------------------------------------------

import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/lib/auth/config";
import { getCustomerOrders } from "@/features/customers/queries";
import { OrderStatusBadge } from "@/features/orders/components/OrderStatusBadge";
import { formatPrice } from "@/lib/formatPrice";

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
        <h2 className="text-xl font-bold text-card-foreground">No autorizado</h2>
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
      <div className="py-16 text-center">
        <h2 className="text-xl font-bold text-card-foreground">
          Todavía no hiciste ningún pedido
        </h2>
        <p className="mt-2 text-muted-foreground">
          Explorá nuestro catálogo y hacé tu primer pedido.
        </p>
        <Link
          href="/catalog"
          className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-card-foreground transition-colors hover:bg-primary/80"
        >
          Ver catálogo
        </Link>
      </div>
    );
  }

  // ---- Order list ----------------------------------------------------------

  return (
    <div>
      <h1 className="text-2xl font-bold text-card-foreground">Mis órdenes</h1>

      <div className="mt-6 divide-y divide-border rounded-lg border border-border bg-card">
        {orders.map((order) => (
          <Link
            key={order.id}
            href={`/account/orders/${order.orderNumber}`}
            className="flex items-center justify-between px-4 py-4 transition-colors hover:bg-muted/50"
          >
            <div className="min-w-0 flex-1">
              <p className="font-mono text-sm font-medium text-card-foreground">
                #{order.orderNumber}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {formatDate(order.createdAt)}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <OrderStatusBadge status={order.status} />
              <span className="text-sm font-medium text-card-foreground">
                {formatPrice(order.total, order.payment?.currency ?? "ARS")}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
