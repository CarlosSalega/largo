// ---------------------------------------------------------------------------
// MercadoPago integration — preference creation & payment retrieval
// ---------------------------------------------------------------------------

import { Preference, Payment } from "mercadopago";
import { mpClient } from "@/lib/mercadopago/client";
import db from "@/lib/db/client";
import type { CartItemPayload } from "@/features/checkout/types";

// ---- types -----------------------------------------------------------------

export interface CreatePreferenceInput {
  orderId: string;
  orderNumber: string;
  cartItems: CartItemPayload[];
  currency: string;
}

export interface CreatePreferenceResult {
  init_point?: string;
  error?: string;
}

// ---- helpers ---------------------------------------------------------------

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

/**
 * Compute ISO 8601 date string 30 minutes from now.
 */
function expirationDate(): string {
  const date = new Date(Date.now() + 30 * 60 * 1000);
  return date.toISOString();
}

// ---- createPreference ------------------------------------------------------

/**
 * Create a MercadoPago Checkout Pro preference for an order.
 *
 * Maps internal cart items to the MP item format, attaches order metadata
 * for webhook correlation, and saves the returned `preference.id` to the
 * Payment record as `providerPreferenceId`.
 *
 * @returns `{ init_point }` on success, `{ error }` on failure.
 */
export async function createPreference(
  input: CreatePreferenceInput
): Promise<CreatePreferenceResult> {
  const { orderId, orderNumber, cartItems } = input;

  try {
    const preference = new Preference(mpClient);

    const response = await preference.create({
      body: {
        items: cartItems.map((item, index) => ({
          id: `${item.productId}-${index}`,
          title: item.name,
          unit_price: item.price,
          quantity: item.quantity,
          currency_id: item.currency,
          picture_url: item.image ?? undefined,
        })),
        metadata: {
          orderId,
          orderNumber,
        },
        back_urls: {
          success: `${SITE_URL}/checkout/success?orderNumber=${orderNumber}`,
          failure: `${SITE_URL}/checkout/failure?orderNumber=${orderNumber}`,
          pending: `${SITE_URL}/checkout/pending?orderNumber=${orderNumber}`,
        },
        auto_return: "approved",
        expires: true,
        expiration_date_to: expirationDate(),
        external_reference: orderNumber,
      },
    });

    const init_point = response.init_point;

    if (!response.id || !init_point) {
      return { error: "Error al conectar con MercadoPago. Intentá de nuevo." };
    }

    // Persist the MercadoPago preference ID on the Payment record
    await db.payment.update({
      where: { orderId },
      data: { providerPreferenceId: response.id },
    });

    return { init_point };

  } catch (error) {
    console.error("[createPreference] Error:", error);
    return { error: "Error al conectar con MercadoPago. Intentá de nuevo." };
  }
}

// ---- getMPPayment ----------------------------------------------------------

/**
 * Retrieve a payment by its MercadoPago payment ID.
 *
 * Used by the webhook handler to confirm the definitive payment status
 * directly from MercadoPago's API rather than trusting the webhook payload.
 */
export async function getMPPayment(paymentId: string | number) {
  const payment = new Payment(mpClient);
  return payment.get({ id: paymentId });
}
