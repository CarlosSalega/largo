# Payments Specification

## Purpose

Payment processing through Mercado Pago Checkout Pro, including SDK initialization, preference creation with metadata pattern, redirect to hosted checkout, webhook reception with signature validation and idempotency, and order status synchronization.

## Requirements

### Requirement: REQ-PAY-01 — MP SDK Initialization
The system SHALL initialize the MercadoPago SDK with the access token from environment variables and with `runtime = "nodejs"` to ensure compatibility with Next.js route handlers.

#### Scenario: SC-PAY-01 — SDK client singleton
- GIVEN `MERCADOPAGO_ACCESS_TOKEN` is set in environment
- WHEN the application imports `src/lib/mercadopago/client.ts`
- THEN a configured `MercadoPagoConfig` instance is created with the access token
- AND the module exports a singleton `mpClient` for reuse across preferences and webhook modules
- AND the route handler that uses it specifies `runtime = "nodejs"` to avoid edge-runtime incompatibility

### Requirement: REQ-PAY-02 — Preference Creation
The system SHALL create a MercadoPago checkout preference using the SDK. The preference includes: cart items as MP items, the order total, `metadata: { orderId, orderNumber }` for webhook correlation, `back_urls` for post-payment redirect, and `auto_return: "approved"`.

#### Scenario: SC-PAY-02 — Successful preference creation
- GIVEN an order exists with id `{orderId}` and orderNumber `V1StGXR8_Z5jd`
- WHEN the checkout flow calls `createPreference(order)`
- THEN the MercadoPago SDK creates a Preference with:
  - `items[]`: one item per cart item (title, unit_price, quantity, currency_id)
  - `metadata`: `{ orderId: "{orderId}", orderNumber: "V1StGXR8_Z5jd" }`
  - `back_urls`: `{ success: "{SITE_URL}/checkout/success?orderNumber=V1StGXR8_Z5jd", failure: "{SITE_URL}/checkout/failure?orderNumber=V1StGXR8_Z5jd", pending: "{SITE_URL}/checkout/pending?orderNumber=V1StGXR8_Z5jd" }`
  - `auto_return`: `"approved"`
  - `expires`: true, `expiration_date_to`: now + 30 min
- AND the returned `preference.id` is stored in `Payment.providerPreferenceId`
- AND the `preference.init_point` URL is returned for client-side redirect

#### Scenario: SC-PAY-03 — Preference creation failure
- GIVEN MercadoPago API is unreachable or returns an error
- WHEN `createPreference` is called
- THEN the Server Action catches the error
- AND the order remains PENDING (no false-success state)
- AND the visitor sees "Error al conectar con MercadoPago. Intentá de nuevo."

### Requirement: REQ-PAY-03 — Redirect to MercadoPago
The system SHALL redirect the customer to MercadoPago's hosted checkout page (`init_point`) after a successful preference creation. Redirect happens client-side via `window.location.href` or Next.js `redirect()`.

#### Scenario: SC-PAY-04 — Client-side redirect
- GIVEN a preference was successfully created with `init_point = "https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=..."`
- WHEN the checkout Server Action returns the redirect URL
- THEN the client-side code executes `window.location.href = init_point`
- AND the customer is taken to MercadoPago's hosted checkout page
- AND the preference details (items, total, expiration) are displayed by MercadoPago

### Requirement: REQ-PAY-04 — Webhook Endpoint
The system SHALL expose a webhook endpoint at `POST /api/webhooks/mercadopago` that receives MercadoPago payment notifications.

#### Scenario: SC-PAY-05 — Webhook received and processed
- GIVEN MercadoPago sends a POST to `/api/webhooks/mercadopago` with a payment notification payload
- WHEN the route handler receives the request
- THEN the handler:
  1. Validates the `x-signature` header
  2. Extracts `eventId` from the payload
  3. Attempts to insert into `WebhookEvent` (idempotency guard)
  4. Queries MercadoPago API for real payment status (GET `/v1/payments/{id}`)
  5. Updates Payment and Order status based on the confirmed status
  6. Returns HTTP 200

### Requirement: REQ-PAY-05 — Webhook Signature Validation
The system SHALL validate the `x-signature` header on every incoming webhook request against the `MERCADOPAGO_WEBHOOK_SECRET` environment variable. Invalid signatures receive HTTP 401.

#### Scenario: SC-PAY-06 — Valid signature
- GIVEN a webhook arrives with `x-signature: {valid_hash}` and `x-request-id: {request_id}`
- WHEN the endpoint computes the expected signature
- THEN the computed hash matches the provided signature
- AND processing continues

#### Scenario: SC-PAY-07 — Invalid signature
- GIVEN a webhook arrives with `x-signature: {invalid_hash}`
- WHEN the endpoint validates the signature
- THEN the computed hash does NOT match
- AND HTTP 401 is returned immediately
- AND no further processing occurs

### Requirement: REQ-PAY-06 — Webhook Idempotency
The system SHALL prevent duplicate webhook processing using the `WebhookEvent.eventId @unique` database constraint.

#### Scenario: SC-PAY-08 — First-time webhook
- GIVEN a webhook with eventId `"evt_123abc"` has never been received
- WHEN the endpoint attempts to insert `WebhookEvent { eventId: "evt_123abc" }`
- THEN the insert succeeds (no unique constraint violation)
- AND processing continues normally

#### Scenario: SC-PAY-09 — Duplicate webhook
- GIVEN a webhook with eventId `"evt_123abc"` was already processed previously
- WHEN the endpoint attempts to insert another `WebhookEvent` with the same `eventId`
- THEN the insert fails with a unique constraint violation
- AND the endpoint catches the Prisma error (`P2002`)
- AND returns HTTP 200 (idempotent acknowledgment — MercadoPago considers it successful)
- AND no payment or order status change occurs

### Requirement: REQ-PAY-07 — Payment Approved
The system SHALL update the Order status to PAID and Payment status to APPROVED when a webhook confirms payment approval. The MercadoPago API is consulted for the definitive status.

#### Scenario: SC-PAY-10 — Webhook confirms approved payment
- GIVEN a webhook arrives for a payment notification
- WHEN the endpoint queries MercadoPago API and receives `status: "approved"`
- THEN `Payment.status` is updated to `APPROVED`
- AND `Payment.providerPaymentId` is set to the MP payment ID
- AND `Payment.paidAt` is set to the current timestamp
- AND `Order.status` is updated to `PAID`

#### Scenario: SC-PAY-11 — Webhook event marked processed
- GIVEN a webhook has been fully processed (payment status synced, order updated)
- WHEN processing completes
- THEN `WebhookEvent.processed` is set to `true`
- AND `WebhookEvent.processedAt` is set to the current timestamp

### Requirement: REQ-PAY-08 — Payment Rejected
The system SHALL update the Order status to CANCELLED and release reserved stock when a webhook confirms payment rejection.

#### Scenario: SC-PAY-12 — Webhook confirms rejected payment
- GIVEN a webhook arrives and MP API confirms `status: "rejected"`
- WHEN the endpoint processes the rejection
- THEN `Payment.status` is updated to `REJECTED`
- AND `Order.status` is updated to `CANCELLED`
- AND reserved stock is released (`Product.stock += OrderItem.quantity` for each item)
- AND `WebhookEvent.processed` is set to `true`

### Requirement: REQ-PAY-09 — Preference Expiration
The system SHALL configure MercadoPago preferences with a 30-minute expiration window. Expired-preference stock cleanup happens at the next checkout, not via cron.

#### Scenario: SC-PAY-13 — Preference with expiration
- GIVEN a MercadoPago preference is created for an order
- WHEN the preference is configured
- THEN the `expires` field is set to `true`
- AND the `expiration_date_to` is set to `now + 30 minutes` (ISO 8601)
- AND after expiration, MercadoPago rejects payment attempts for this preference

### Requirement: REQ-PAY-10 — Error Handling
The system SHALL handle webhook processing errors with appropriate HTTP status codes and messages.

#### Scenario: SC-PAY-14 — Invalid signature
- GIVEN a webhook request arrives with an invalid or missing `x-signature` header
- WHEN the endpoint validates the signature
- THEN the server responds with HTTP 401 Unauthorized
- AND the payload is NOT processed
- AND no WebhookEvent record is created

#### Scenario: SC-PAY-15 — Unknown payment
- GIVEN a valid webhook arrives referencing a `data.id` that does not match any Payment record
- WHEN the endpoint queries the database for the payment
- THEN the server responds with HTTP 404 Not Found
- AND the event is NOT logged (unknown payment means unknown order context)

#### Scenario: SC-PAY-16 — Duplicate webhook (idempotent response)
- GIVEN a webhook with `eventId` already exists in WebhookEvent table
- WHEN the same webhook arrives again
- THEN the server responds with HTTP 200 OK
- AND no processing occurs
- AND the response is identical to the first successful response (idempotent)

### Requirement: Payment Validation
The system SHALL validate payment notifications against Mercado Pago API.

#### Scenario: Validate payment status
- GIVEN a payment notification is received
- WHEN the system queries Mercado Pago API for payment details
- THEN the actual payment status is confirmed

### Requirement: Payment Record
The system SHALL store payment records for each transaction.

#### Scenario: Payment record creation
- GIVEN a payment is processed
- WHEN the webhook is handled
- THEN a payment record is stored with provider, provider ID, status, amount, and timestamp

### Requirement: Webhook Event Logging
The system SHALL log all webhook events for audit purposes.

#### Scenario: Event logged
- GIVEN any webhook notification is received
- WHEN the endpoint processes it
- THEN the full payload, event ID, and processing status are logged
