// ---------------------------------------------------------------------------
// Payments utilities — webhook signature validation
// ---------------------------------------------------------------------------

import {
  WebhookSignatureValidator,
  InvalidWebhookSignatureError,
  SignatureFailureReason,
} from "mercadopago";

// ---- validateSignature -----------------------------------------------------

/**
 * Validate a MercadoPago webhook signature.
 *
 * Wraps the official SDK validator for constant-time HMAC comparison and
 * replay-attack protection via timestamp tolerance.
 *
 * @param xSignature — value of the `x-signature` request header
 * @param xRequestId — value of the `x-request-id` request header
 * @param dataId     — the `data.id` from the webhook payload (payment ID)
 * @param secret     — MercadoPago webhook secret from env
 *
 * @returns `true` if the signature is valid; `false` otherwise.
 */
export function validateSignature(
  xSignature: string | null,
  xRequestId: string | null,
  dataId: string,
  secret: string
): boolean {
  try {
    WebhookSignatureValidator.validate({
      xSignature,
      xRequestId,
      dataId,
      secret,
      toleranceSeconds: 300, // 5-minute window for replay protection
    });
    return true;
  } catch (error) {
    if (error instanceof InvalidWebhookSignatureError) {
      console.warn(
        "[validateSignature] Invalid signature:",
        error.reason,
        error.requestId ?? ""
      );
      return false;
    }
    // Unexpected errors should not silently pass validation
    console.error("[validateSignature] Unexpected error:", error);
    return false;
  }
}

// Re-export for use in route handler logging
export { SignatureFailureReason };
