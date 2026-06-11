// ---------------------------------------------------------------------------
// Custom 404 for account order detail — "Pedido no encontrado"
// ---------------------------------------------------------------------------

import Link from "next/link";

export default function AccountOrderNotFound() {
  return (
    <div className="py-16 text-center">
      <h2 className="text-xl font-bold text-white">Pedido no encontrado</h2>
      <p className="mt-2 text-slate-400">
        El pedido que buscás no existe o no te pertenece.
      </p>
      <Link
        href="/account/orders"
        className="mt-4 inline-block text-sm text-blue-400 transition-colors hover:text-blue-300"
      >
        ← Volver a mis órdenes
      </Link>
    </div>
  );
}
