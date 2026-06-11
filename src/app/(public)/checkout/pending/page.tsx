// ---------------------------------------------------------------------------
// Checkout pending page — shown after MercadoPago redirect (in_process/pending)
// ---------------------------------------------------------------------------

import type { Metadata } from "next";
import Link from "next/link";
import { getOrderByNumber } from "@/features/orders/queries";
import { OrderStatusBadge } from "@/features/orders/components/OrderStatusBadge";
import { formatPrice } from "@/lib/formatPrice";

// ---- metadata --------------------------------------------------------------

export const metadata: Metadata = {
  title: "Pago pendiente | Largo",
  description: "Tu pago está siendo procesado. Te notificaremos cuando se confirme.",
  robots: { index: false, follow: false },
};

// ---- types -----------------------------------------------------------------

interface PendingPageProps {
  searchParams: Promise<{ orderNumber?: string }>;
}

// ---- page ------------------------------------------------------------------

export default async function PendingPage({
  searchParams,
}: PendingPageProps) {
  const { orderNumber } = await searchParams;

  const order = orderNumber ? await getOrderByNumber(orderNumber) : null;

  const currency = order?.payment?.currency ?? "ARS";

  return (
    <div className="flex min-h-[60vh] items-center justify-center py-16">
      <div className="mx-auto w-full max-w-lg px-4 text-center">
        {/* Pending icon */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-600/20">
          <svg
            className="h-8 w-8 text-amber-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h1 className="mb-2 text-3xl font-bold text-white">
          Pago en proceso
        </h1>

        {orderNumber && (
          <p className="mb-6 font-mono text-sm text-slate-400">
            Orden #{orderNumber}
          </p>
        )}

        <p className="mb-8 text-slate-300">
          Estamos esperando la confirmación de tu pago. Esto puede tardar unos
          minutos. No cierres esta página — te notificaremos cuando se complete.
        </p>

        {/* Order summary (when order data is available) */}
        {order && (
          <div className="mb-8 text-left">
            <div className="flex items-center justify-between rounded-t-lg border border-slate-800 bg-slate-900/50 px-4 py-3">
              <span className="text-sm text-slate-400">Estado</span>
              <OrderStatusBadge status={order.status} />
            </div>

            <div className="divide-y divide-slate-800 rounded-b-lg border border-t-0 border-slate-800 bg-slate-900/50">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-white">
                      {item.productName}
                    </p>
                    <p className="text-xs text-slate-500">
                      Cantidad: {item.quantity}
                    </p>
                  </div>
                  <p className="ml-4 text-sm text-slate-300">
                    {formatPrice(item.subtotal, currency)}
                  </p>
                </div>
              ))}

              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-sm font-medium text-slate-300">
                  Total
                </span>
                <span className="font-bold text-white">
                  {formatPrice(order.total, currency)}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col items-center gap-3">
          <Link
            href="/catalog"
            className="inline-flex rounded-lg bg-slate-700 px-6 py-3 font-medium text-white transition-colors hover:bg-slate-600"
          >
            Volver a la tienda
          </Link>
          <p className="text-xs text-slate-500">
            Te avisaremos por email cuando el pago se confirme.
          </p>
        </div>
      </div>
    </div>
  );
}
