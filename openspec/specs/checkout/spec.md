# Checkout Specification

## Purpose

Checkout flow that collects customer and shipping information, validates with Zod, creates a pending order atomically via Server Action, handles stock race conditions, and initiates payment through Mercado Pago Checkout Pro.

## Requirements

### Requirement: REQ-CHK-01 — Multi-Step Form Wizard
The system SHALL present checkout as a multi-step form: Customer Information → Shipping Address → Order Review → Confirm.

#### Scenario: SC-CHK-01 — Navigate through steps
- GIVEN the visitor starts checkout with items in cart
- WHEN the checkout page loads
- THEN step 1 (Customer Information) is displayed first
- AND the visitor can click "Continuar" to advance to the next step after filling required fields
- AND a step indicator at the top shows progress (e.g., 1/3)

#### Scenario: SC-CHK-02 — Go back to previous step
- GIVEN the visitor is on step 2 (Shipping Address)
- WHEN the visitor clicks "Volver"
- THEN step 1 is redisplayed with previously entered data preserved

### Requirement: REQ-CHK-02 — Form Validation (Zod)
The system SHALL validate each step's form data using Zod schemas before allowing progression to the next step.

#### Scenario: SC-CHK-03 — Valid data advances
- GIVEN the visitor fills all required fields with valid data on step 1
- WHEN the visitor clicks "Continuar"
- THEN validation passes and step 2 is displayed

#### Scenario: SC-CHK-04 — Invalid data shows errors
- GIVEN the visitor submits a step with an empty required field
- WHEN the form is submitted
- THEN inline error messages are displayed below each invalid field
- AND the visitor remains on the current step

### Requirement: REQ-CHK-03 — Customer Information
The system SHALL collect the visitor's full name, email, and phone during checkout. All guest checkout — no authentication required.

#### Scenario: SC-CHK-05 — Customer step fields
- GIVEN the visitor is on step 1 of checkout
- WHEN the customer information step renders
- THEN fields for `name` (required), `email` (required, valid email format), and `phone` (optional) are displayed
- AND all labels and placeholders are in Spanish

#### Scenario: SC-CHK-06 — Guest checkout
- GIVEN the visitor is not authenticated
- WHEN the visitor completes the customer info step
- THEN checkout proceeds without requiring account creation
- AND the order is created with `userId = null`

### Requirement: REQ-CHK-04 — Shipping Address
The system SHALL collect the shipping address: street, city, state, zip code, and country.

#### Scenario: SC-CHK-07 — Shipping step fields
- GIVEN the visitor is on step 2 of checkout
- WHEN the shipping address step renders
- THEN fields for `street` (required), `city` (required), `state` (required), `zipCode` (required), and `country` (required) are displayed
- AND country defaults to "Argentina"

#### Scenario: SC-CHK-08 — Valid shipping data
- GIVEN the visitor fills all shipping fields with valid data
- WHEN the visitor clicks "Continuar"
- THEN the address is validated and step 3 (Order Review) is displayed

### Requirement: REQ-CHK-05 — Order Summary
The system SHALL display a read-only order summary on the review step showing all cart items, quantities, unit prices (with currency), and total.

#### Scenario: SC-CHK-09 — Review step summary
- GIVEN the visitor reaches the review step (step 3)
- WHEN the step renders
- THEN each cart item is listed with product name, quantity, unit price with currency, and line subtotal
- AND the cart total is displayed prominently
- AND a "Confirmar pedido" button is shown

### Requirement: REQ-CHK-06 — Order Creation (Server Action)
The system SHALL create the order atomically via a Server Action (`confirmCheckout`) using `prisma.$transaction`. The transaction creates: Order + OrderItems + Address + Payment in a single write, decrements stock atomically with `WHERE stock >= quantity`, and clears the cart client-side on success.

#### Scenario: SC-CHK-10 — Successful order creation
- GIVEN all checkout steps are completed with valid data and stock is sufficient
- WHEN the visitor clicks "Confirmar pedido"
- THEN the Server Action executes an atomic transaction:
  - Creates Order (status PENDING, with NanoID orderNumber)
  - Creates OrderItems (one per cart item, with product snapshots)
  - Creates Address (linked to Order)
  - Creates Payment (status PENDING, provider "mercadopago")
  - Decrements Product.stock for each item (with `WHERE stock >= quantity`)
- AND the client-side cart is cleared
- AND the visitor is redirected to the MercadoPago payment flow (handled by payments module)

#### Scenario: SC-CHK-11 — Order creation with orderNumber
- GIVEN a checkout is confirmed
- WHEN the Order record is created
- THEN `orderNumber` is a unique NanoID of exactly 12 characters
- AND no prefix is applied (e.g., `V1StGXR8_Z5jd`)

### Requirement: REQ-CHK-07 — Stock Validation
The system SHALL validate stock availability atomically within the order creation transaction. If stock is insufficient for any item, the entire transaction is rolled back.

#### Scenario: SC-CHK-12 — Stock sufficient
- GIVEN a product has stock = 10 and the order quantity is 3
- WHEN the checkout transaction executes
- THEN the stock decrement succeeds (WHERE stock >= 3 matches)
- AND Product.stock becomes 7

#### Scenario: SC-CHK-13 — Stock race condition
- GIVEN two visitors concurrently check out with the last unit of the same product
- WHEN both transactions attempt to decrement stock
- THEN only ONE transaction succeeds (the WHERE clause fails for the second)
- AND the failed transaction returns a "Producto agotado" error to the visitor
- AND the visitor is returned to the cart page with the out-of-stock item highlighted

### Requirement: REQ-CHK-08 — Expired Preference Cleanup
The system SHALL release stock from PENDING orders whose MercadoPago preference has exceeded the 30-minute timeout. Cleanup runs as part of the checkout Server Action (before creating a new order), not as a cron job.

#### Scenario: SC-CHK-14 — Stale stock released at checkout
- GIVEN an existing PENDING order was created 31 minutes ago with 2 reserved products
- WHEN a new checkout transaction begins
- THEN the expired order's stock is released (Product.stock += reserved quantity)
- AND the expired order's status remains PENDING (no status change, just stock released)
- AND the new checkout proceeds with the restored stock available

### Requirement: REQ-CHK-09 — Empty Cart Redirect
The system SHALL prevent checkout with an empty cart.

#### Scenario: SC-CHK-15 — Redirect from empty cart
- GIVEN the visitor navigates to `/checkout` with an empty cart
- WHEN the checkout page loads
- THEN the visitor is redirected to `/cart`
- AND a notice "Agregá productos al carrito antes de continuar" is shown

### Requirement: REQ-CHK-10 — Error Handling
The system SHALL handle checkout errors gracefully: transaction failures, stock race conditions, and network errors.

#### Scenario: SC-CHK-16 — Transaction failure
- GIVEN a database error occurs during the checkout transaction
- WHEN the Server Action catches the error
- THEN the visitor sees "Ocurrió un error al procesar tu pedido. Intentá de nuevo."
- AND the cart is NOT cleared
- AND no partial data is committed

#### Scenario: SC-CHK-17 — Server Action network error
- GIVEN the visitor confirms the order
- WHEN the network request to the Server Action fails (timeout or connection error)
- THEN the visitor sees an error message
- AND the "Confirmar pedido" button is re-enabled for retry
- AND the cart is NOT cleared

### Requirement: Mercado Pago Preference Creation
The system SHALL create a Mercado Pago checkout preference for the order. Implementation details are owned by the payments module.

#### Scenario: Preference creation
- GIVEN a pending order exists
- WHEN checkout is confirmed
- THEN a Mercado Pago preference is created with order items and total amount

#### Scenario: Preference creation failure
- GIVEN Mercado Pago API is unavailable
- WHEN preference creation is attempted
- THEN an error message is shown and the order remains pending

### Requirement: Redirect to Mercado Pago
The system SHALL redirect the customer to Mercado Pago for payment.

#### Scenario: Successful redirect
- GIVEN a Mercado Pago preference was created
- WHEN the order is confirmed
- THEN the customer is redirected to Mercado Pago's hosted checkout page

### Requirement: Checkout Return URLs
The system SHALL configure return URLs for post-payment navigation.

#### Scenario: Payment success return
- GIVEN the customer completes payment on Mercado Pago
- WHEN Mercado Pago redirects back
- THEN the customer lands on the order success page

#### Scenario: Payment failure return
- GIVEN the customer's payment is rejected on Mercado Pago
- WHEN Mercado Pago redirects back
- THEN the customer lands on the payment failure page with retry option
