import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pago no procesado | Largo",
  robots: { index: false, follow: false },
};

interface FailurePageProps {
  searchParams: Promise<{ orderNumber?: string }>;
}

export default async function FailurePage({ searchParams }: FailurePageProps) {
  const { orderNumber } = await searchParams;

  return (
    <div className="flex min-h-[60vh] items-center justify-center py-16">
      <div className="mx-auto max-w-md text-center">
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
          <p className="mb-4 font-mono text-sm text-slate-400">
            Orden #{orderNumber}
          </p>
        )}

        <p className="mb-8 text-slate-300">
          Ocurrió un problema con tu pago. Podés intentarlo nuevamente desde
          el carrito.
        </p>

        <Link
          href="/cart"
          className="inline-flex rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
        >
          Volver al carrito
        </Link>
      </div>
    </div>
  );
}
