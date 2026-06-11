import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pedido confirmado | Largo",
  robots: { index: false, follow: false },
};

interface SuccessPageProps {
  searchParams: Promise<{ orderNumber?: string }>;
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const { orderNumber } = await searchParams;

  return (
    <div className="flex min-h-[60vh] items-center justify-center py-16">
      <div className="mx-auto max-w-md text-center">
        {/* Success icon */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-600/20">
          <svg
            className="h-8 w-8 text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="mb-2 text-3xl font-bold text-white">
          ¡Pedido confirmado!
        </h1>

        {orderNumber && (
          <p className="mb-4 font-mono text-sm text-slate-400">
            Orden #{orderNumber}
          </p>
        )}

        <p className="mb-8 text-slate-300">
          Pago recibido — estamos procesando tu pedido.
        </p>

        <Link
          href="/catalog"
          className="inline-flex rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
        >
          Seguir comprando
        </Link>
      </div>
    </div>
  );
}
