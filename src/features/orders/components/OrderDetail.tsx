// ---------------------------------------------------------------------------
// OrderDetail — server component displaying the full order
// ---------------------------------------------------------------------------

import { formatPrice } from "@/lib/formatPrice";
import { OrderStatusBadge } from "./OrderStatusBadge";

// ---- types -----------------------------------------------------------------

type OrderWithRelations = NonNullable<
  Awaited<ReturnType<typeof import("@/features/orders/queries").getOrderByNumber>>
>;

// ---- helpers ---------------------------------------------------------------

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);
}

// ---- component -------------------------------------------------------------

interface OrderDetailProps {
  order: OrderWithRelations;
}

export function OrderDetail({ order }: OrderDetailProps) {
  const paymentCurrency = order.payment?.currency ?? "ARS";

  return (
    <div className="mx-auto max-w-2xl space-y-8 py-8">
      {/* ---- Header: order number + status ---- */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-400">Pedido</p>
          <h1 className="font-mono text-2xl font-bold text-white">
            #{order.orderNumber}
          </h1>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* ---- Items ---- */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-white">Productos</h2>
        <div className="divide-y divide-slate-800 rounded-lg border border-slate-800 bg-slate-900/50">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">
                  {item.productName}
                </p>
                <p className="text-xs text-slate-400">
                  Cantidad: {item.quantity}
                </p>
              </div>
              <div className="ml-4 text-right">
                <p className="text-sm font-medium text-white">
                  {formatPrice(item.subtotal, paymentCurrency)}
                </p>
                <p className="text-xs text-slate-500">
                  {formatPrice(item.productPrice, paymentCurrency)} c/u
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---- Total ---- */}
      <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-3">
        <span className="text-sm font-medium text-slate-300">Total</span>
        <span className="text-lg font-bold text-white">
          {formatPrice(order.total, paymentCurrency)}
        </span>
      </div>

      {/* ---- Shipping address ---- */}
      {order.address && (
        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">
            Dirección de envío
          </h2>
          <div className="rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-3 text-sm text-slate-300">
            <p>{order.address.street}</p>
            <p>
              {order.address.city}, {order.address.state} —{" "}
              {order.address.zipCode}
            </p>
            <p>{order.address.country}</p>
          </div>
        </section>
      )}

      {/* ---- Customer info ---- */}
      <section>
        <h2 className="mb-3 text-lg font-semibold text-white">Cliente</h2>
        <div className="rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-3 text-sm text-slate-300">
          <p className="font-medium text-white">{order.customerName}</p>
          <p>{order.customerEmail}</p>
          {order.customerPhone && <p>{order.customerPhone}</p>}
        </div>
      </section>

      {/* ---- Payment status ---- */}
      {order.payment && (
        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">Pago</h2>
          <div className="flex items-center gap-4 rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-3 text-sm">
            <div className="text-slate-400">Estado:</div>
            <div className="font-medium text-white">{order.payment.status}</div>
            {order.payment.provider && (
              <>
                <div className="text-slate-400">Proveedor:</div>
                <div className="font-medium text-white capitalize">
                  {order.payment.provider}
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {/* ---- Created at ---- */}
      <p className="text-xs text-slate-600">
        Pedido creado el {formatDate(order.createdAt)}
      </p>
    </div>
  );
}
