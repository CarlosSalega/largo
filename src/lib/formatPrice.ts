import type { Prisma } from "@prisma/client";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type Decimal = Prisma.Decimal;

function toNumber(price: Decimal | number): number {
  if (typeof price === "object" && price !== null && "toNumber" in price) {
    return (price as { toNumber(): number }).toNumber();
  }
  return Number(price);
}

// ---------------------------------------------------------------------------
// Currency → locale map
// ---------------------------------------------------------------------------

const CURRENCY_LOCALE: Record<string, string> = {
  USD: "en-US",
  ARS: "es-AR",
};

// ---------------------------------------------------------------------------
// formatPrice — centralized price formatter
// ---------------------------------------------------------------------------

/**
 * Format a numeric price value with the correct locale and currency symbol.
 *
 * @param price  — Prisma Decimal or plain number
 * @param currency — "USD" (en-US) or "ARS" (es-AR). Defaults to "USD".
 * @returns Formatted price string (e.g. "$1,299.99" or "$ 1.299,99")
 */
export function formatPrice(price: Decimal | number, currency = "USD"): string {
  const locale = CURRENCY_LOCALE[currency] ?? "en-US";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(toNumber(price));
}

export function priceAsString(price: Decimal | number): string {
  return toNumber(price).toFixed(2);
}
