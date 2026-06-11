// ---------------------------------------------------------------------------
// Admin order detail — full order view with refund action (PAID orders only)
// Server Component — fetches order by orderNumber
// ---------------------------------------------------------------------------

import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import db from "@/lib/db/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { OrderDetail } from "@/features/orders/components/OrderDetail";
import { RefundOrderButton } from "@/components/admin/RefundOrderButton";
import { formatPrice } from "@/lib/formatPrice";

// ── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}): Promise<Metadata> {
  const { orderNumber } = await params;

  return {
    title: `Orden ${orderNumber} | Admin | Largo`,
    robots: { index: false, follow: false },
  };
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;

  const order = await db.order.findUnique({
    where: { orderNumber },
    include: {
      items: {
        include: { product: true },
      },
      address: true,
      payment: true,
      user: { select: { id: true, name: true, email: true } },
    },
  });

  if (!order) {
    notFound();
  }

  const paymentCurrency = order.payment?.currency ?? "ARS";

  return (
    <div className="flex flex-col gap-6">
      {/* ── Back link ──────────────────────────────────────────────────── */}
      <Button asChild variant="ghost" size="sm" className="w-fit">
        <Link href="/admin/orders">
          <ArrowLeft data-icon="inline-start" />
          ←&nbsp;Volver a órdenes
        </Link>
      </Button>

      {/* ── Order detail (reuses existing component) ───────────────────── */}
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <OrderDetail order={order as any} />

      {/* ── Customer info (additional admin context) ────────────────────── */}
      <section className="rounded-lg border border-border bg-card px-4 py-4">
        <h2 className="mb-3 text-lg font-semibold text-card-foreground">
          Información del cliente
        </h2>
        <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          <div>
            <span className="text-muted-foreground">Nombre: </span>
            <span className="font-medium text-card-foreground">
              {order.customerName}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Email: </span>
            <span className="font-medium text-card-foreground">
              {order.customerEmail}
            </span>
          </div>
          {order.customerPhone && (
            <div>
              <span className="text-muted-foreground">Teléfono: </span>
              <span className="font-medium text-card-foreground">
                {order.customerPhone}
              </span>
            </div>
          )}
          {order.user && (
            <div>
              <span className="text-muted-foreground">Usuario: </span>
              <span className="font-medium text-card-foreground">
                {order.user.name} ({order.user.email})
              </span>
            </div>
          )}
        </div>
      </section>

      {/* ── Payment info ───────────────────────────────────────────────── */}
      {order.payment && (
        <section className="rounded-lg border border-border bg-card px-4 py-4">
          <h2 className="mb-3 text-lg font-semibold text-card-foreground">
            Información del pago
          </h2>
          <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
            <div>
              <span className="text-muted-foreground">Proveedor: </span>
              <span className="font-medium text-card-foreground capitalize">
                {order.payment.provider}
              </span>
            </div>
            {order.payment.providerPaymentId && (
              <div>
                <span className="text-muted-foreground">ID de pago: </span>
                <span className="font-mono text-sm text-card-foreground">
                  {order.payment.providerPaymentId}
                </span>
              </div>
            )}
            <div>
              <span className="text-muted-foreground">Estado: </span>
              <Badge
                variant={
                  order.payment.status === "APPROVED"
                    ? "secondary"
                    : order.payment.status === "REFUNDED"
                      ? "outline"
                      : order.payment.status === "REJECTED"
                        ? "destructive"
                        : "secondary"
                }
              >
                {order.payment.status === "APPROVED"
                  ? "Aprobado"
                  : order.payment.status === "REFUNDED"
                    ? "Reembolsado"
                    : order.payment.status === "REJECTED"
                      ? "Rechazado"
                      : "Pendiente"}
              </Badge>
            </div>
            <div>
              <span className="text-muted-foreground">Monto: </span>
              <span className="font-medium tabular-nums text-card-foreground">
                {formatPrice(order.payment.amount, paymentCurrency)}
              </span>
            </div>
          </div>
        </section>
      )}

      <Separator />

      {/* ── Refund action ──────────────────────────────────────────────── */}
      {order.status === "PAID" && (
        <div className="flex items-center gap-4 rounded-lg border border-border bg-card px-4 py-3">
          <div className="flex-1">
            <p className="text-sm font-medium text-card-foreground">
              Acciones disponibles
            </p>
            <p className="text-xs text-muted-foreground">
              Esta orden está pagada y puede ser reembolsada.
            </p>
          </div>
          <RefundOrderButton orderId={order.id} />
        </div>
      )}
    </div>
  );
}
