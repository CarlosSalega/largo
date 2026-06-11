// ---------------------------------------------------------------------------
// MercadoPago SDK client singleton
// ---------------------------------------------------------------------------

import { MercadoPagoConfig } from "mercadopago";

/**
 * Shared MercadoPagoConfig instance.
 *
 * Initialized once with the access token from environment variables.
 * Used by both the preference creation module and the webhook handler.
 *
 * @throws if MERCADOPAGO_ACCESS_TOKEN is missing (fails fast at import time)
 */
export const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});
