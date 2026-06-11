// ---------------------------------------------------------------------------
// Public order detail page — /orders/{orderNumber}
// ---------------------------------------------------------------------------

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getOrderByNumber } from "@/features/orders/queries";
import { OrderDetail } from "@/features/orders/components/OrderDetail";

// ---- types -----------------------------------------------------------------

interface OrderDetailPageProps {
  params: Promise<{ orderNumber: string }>;
}

// ---- metadata --------------------------------------------------------------

export async function generateMetadata({
  params,
}: OrderDetailPageProps): Promise<Metadata> {
  const { orderNumber } = await params;

  return {
    title: `Pedido ${orderNumber} | Largo`,
    description: `Detalle del pedido ${orderNumber} en Largo Store.`,
    robots: { index: false, follow: false },
  };
}

// ---- page ------------------------------------------------------------------

export default async function OrderDetailPage({
  params,
}: OrderDetailPageProps) {
  const { orderNumber } = await params;

  const order = await getOrderByNumber(orderNumber);

  if (!order) {
    notFound();
  }

  return (
    <div className="min-h-[60vh] py-8">
      <OrderDetail order={order} />

      <div className="mx-auto max-w-2xl pt-4 text-center">
        <Link
          href="/catalog"
          className="text-sm text-slate-400 transition-colors hover:text-white"
        >
          ← Volver al catálogo
        </Link>
      </div>
    </div>
  );
}
