// ---------------------------------------------------------------------------
// Checkout failure page — shown after MercadoPago redirect (rejected/expired)
// ---------------------------------------------------------------------------

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getOrderByNumber } from "@/features/orders/queries";
import { createPreference } from "@/features/payments/mercadopago";
import { OrderStatusBadge } from "@/features/orders/components/OrderStatusBadge";
import { formatPrice } from "@/lib/formatPrice";

// ---- metadata --------------------------------------------------------------

export const metadata: Metadata = {
  title: "Pago no procesado | Largo",
  description:
    "El pago no pudo ser procesado. Podés intentarlo nuevamente.",
  robots: { index: false, follow: false },
};

// ---- types -----------------------------------------------------------------

interface FailurePageProps {
  searchParams: Promise<{ orderNumber?: string }>;
}

// ---- retry server action ---------------------------------------------------

async function retryPaymentAction(formData: FormData) {
  "use server";

  const orderNumber = formData.get("orderNumber") as string;
  if (!orderNumber) return;

  const order = await getOrderByNumber(orderNumber);
  if (!order || !order.payment) return;

  const result = await createPreference({
    orderId: order.id,
    orderNumber: order.orderNumber,
    cartItems: order.items.map((item) => ({
      productId: item.productId,
      name: item.productName,
      price: Number(item.productPrice),
      currency: order.payment!.currency,
      quantity: item.quantity,
      image: item.productImage,
      stock: 0,
    })),
    currency: order.payment.currency,
  });

  if (result.init_point) {
    redirect(result.init_point);
  }
}

// ---- page ------------------------------------------------------------------

export default async function FailurePage({
  searchParams,
}: FailurePageProps) {
  const { orderNumber } = await searchParams;

  const order = orderNumber ? await getOrderByNumber(orderNumber) : null;
  const currency = order?.payment?.currency ?? "ARS";

  return (
    <div className="flex min-h-[60vh] items-center justify-center py-16">
      <div className="mx-auto w-full max-w-lg px-4 text-center">
        {/* Warning icon */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-600/20">
          <svg
            className="h-8 w-8 text-yellow-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h1 className="mb-2 text-3xl font-bold text-white">
          El pago no pudo ser procesado
        </h1>

        {orderNumber && (
          <p className="mb-6 font-mono text-sm text-slate-400">
            Orden #{orderNumber}
          </p>
        )}

        {/* Contextual message — expired vs rejected */}
        <p className="mb-8 text-slate-300">
          {order?.status === "PENDING"
            ? "La sesión de pago expiró. Podés generar un nuevo intento."
            : "Ocurrió un problema con tu pago. Podés intentarlo nuevamente."}
        </p>

        {/* Order summary (when data available) */}
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

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          {order && order.status === "PENDING" && orderNumber && (
            <form action={retryPaymentAction}>
              <input type="hidden" name="orderNumber" value={orderNumber} />
              <button
                type="submit"
                className="inline-flex w-full rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
              >
                Reintentar pago
              </button>
            </form>
          )}

          <Link
            href="/cart"
            className="inline-flex rounded-lg border border-slate-700 bg-transparent px-6 py-3 font-medium text-slate-300 transition-colors hover:bg-slate-800"
          >
            Volver al carrito
          </Link>
        </div>
      </div>
    </div>
  );
}
