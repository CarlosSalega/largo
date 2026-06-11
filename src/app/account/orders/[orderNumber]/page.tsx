// ---------------------------------------------------------------------------
// Account order detail page — /account/orders/{orderNumber}
// ---------------------------------------------------------------------------

import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth/config";
import { getCustomerOrderByNumber } from "@/features/customers/queries";
import { OrderDetail } from "@/features/orders/components/OrderDetail";

// ---- types -----------------------------------------------------------------

interface AccountOrderDetailPageProps {
  params: Promise<{ orderNumber: string }>;
}

// ---- metadata --------------------------------------------------------------

export async function generateMetadata({
  params,
}: AccountOrderDetailPageProps): Promise<Metadata> {
  const { orderNumber } = await params;

  return {
    title: `Pedido ${orderNumber} | Largo`,
    description: `Detalle de tu pedido ${orderNumber} en Largo Store.`,
    robots: { index: false, follow: false },
  };
}

// ---- page ------------------------------------------------------------------

export default async function AccountOrderDetailPage({
  params,
}: AccountOrderDetailPageProps) {
  const { orderNumber } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Defensive: proxy.ts should prevent this, but handle edge case
  if (!session) {
    return (
      <div className="py-16 text-center">
        <h2 className="text-xl font-bold text-white">No autorizado</h2>
        <p className="mt-2 text-slate-400">
          Iniciá sesión para ver el detalle del pedido.
        </p>
        <Link
          href="/ingresar"
          className="mt-4 inline-block text-sm text-blue-400 transition-colors hover:text-blue-300"
        >
          Ir a Ingresar
        </Link>
      </div>
    );
  }

  const order = await getCustomerOrderByNumber(
    session.user.id,
    orderNumber
  );

  if (!order) {
    notFound();
  }

  return (
    <div>
      <OrderDetail order={order} />

      <div className="mx-auto max-w-2xl pt-4 text-center">
        <Link
          href="/account/orders"
          className="text-sm text-slate-400 transition-colors hover:text-white"
        >
          ← Volver a mis órdenes
        </Link>
      </div>
    </div>
  );
}
