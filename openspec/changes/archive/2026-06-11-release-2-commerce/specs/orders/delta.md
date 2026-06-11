# Delta for Orders

> **References**: [Orders specification](../../../../specs/orders/spec.md)
> **Change**: Implements order creation with NanoID order numbers, atomic stock reservation/release, a public detail page accessible by order number, and success/failure return pages post-payment.

## Status

| REQ ID | Requirement | Priority | Scenarios | PR |
|--------|------------|----------|-----------|-----|
| REQ-ORD-01 | Order Creation (NanoID) | P0 | SC-ORD-01, SC-ORD-02 | 2 |
| REQ-ORD-02 | Order Status Lifecycle | P0 | SC-ORD-03, SC-ORD-04, SC-ORD-05 | 2,3 |
| REQ-ORD-03 | Stock Reservation (atomic) | P0 | SC-ORD-06 | 2 |
| REQ-ORD-04 | Stock Release | P0 | SC-ORD-07, SC-ORD-08 | 2,3 |
| REQ-ORD-05 | Order Detail Page | P0 | SC-ORD-09, SC-ORD-10 | 4 |
| REQ-ORD-06 | Order List (future) | P2 | SC-ORD-11 | R3 |
| REQ-ORD-07 | Success Page | P0 | SC-ORD-12, SC-ORD-13 | 3,4 |
| REQ-ORD-08 | Failure Page | P1 | SC-ORD-14, SC-ORD-15 | 4 |

**Total**: 8 requirements | 15 scenarios | Budget: PR 2 (~400 lines) + PR 4 (~200 lines)

## ADDED Requirements

### Requirement: REQ-ORD-07 — Success Page
The system SHALL display an order success page after the customer returns from MercadoPago payment. The page shows the order number, status, and next steps.

#### Scenario: SC-ORD-12 — Successful payment return
- GIVEN the customer completed payment on MercadoPago and was redirected to `/checkout/success?orderNumber={orderNumber}`
- WHEN the success page loads
- THEN the page displays: "¡Pedido confirmado!" heading
- AND the order number `{orderNumber}` is shown
- AND a summary of the order (items, total) is displayed
- AND the status shows "Pago recibido — estamos procesando tu pedido"
- AND a "Seguir comprando" link navigates to `/catalog`

#### Scenario: SC-ORD-13 — Success page SEO
- GIVEN the success page renders
- WHEN the page metadata is evaluated
- THEN the page title is "Pedido confirmado | Largo"
- AND noindex meta tag is set (transactional page)

### Requirement: REQ-ORD-08 — Failure Page
The system SHALL display a payment failure page when the customer returns from a rejected or expired MercadoPago payment.

#### Scenario: SC-ORD-14 — Payment rejected return
- GIVEN the customer's payment was rejected and MercadoPago redirected to `/checkout/failure?orderNumber={orderNumber}`
- WHEN the failure page loads
- THEN the page displays: "El pago no pudo ser procesado"
- AND the order number is shown
- AND a "Reintentar pago" button is displayed (creates a new MP preference for the same order)
- AND a "Volver al carrito" link is shown

#### Scenario: SC-ORD-15 — Payment expired return
- GIVEN the customer's payment preference expired (30 min)
- WHEN the customer accesses the failure page
- THEN the page shows "La sesión de pago expiró"
- AND the stock is already released (via expired preference cleanup)
- AND the order is still PENDING (can be retried or abandoned)

### Requirement: REQ-ORD-06 — Order List (Deferred to R3)
The system SHOULD provide an order list page at `/account/orders` for authenticated customers in a future release. The data model supports it (Order.userId), but auth is out of scope for R2.

#### Scenario: SC-ORD-11 — Order list deferred
- GIVEN R2 is the current release
- WHEN evaluating order list requirements
- THEN no `/account/orders` page is implemented
- AND Order.userId field is populated with `null` for all guest orders

## MODIFIED Requirements

### Requirement: REQ-ORD-01 — Order Creation
The system SHALL create orders triggered by the checkout Server Action. Each order receives a unique NanoID 12-character `orderNumber` with no prefix. Order items store product snapshots (name, price, image at purchase time).

(Previously: order creation specified without orderNumber generation strategy or snapshot detail)

#### Scenario: SC-ORD-01 — Order created via checkout
- GIVEN checkout is confirmed with valid customer data, shipping address, and cart items
- WHEN the Server Action executes
- THEN an Order record is created with:
  - `orderNumber`: unique NanoID, 12 characters (e.g., `V1StGXR8_Z5jd`)
  - `status`: PENDING
  - `customerEmail`, `customerName`, `customerPhone` from checkout form
  - `subtotal` and `total` from cart calculation
  - `userId`: null (guest checkout)
- AND OrderItems are created for each cart item with `productName`, `productPrice`, `productImage` snapshots
- AND an Address record is linked to the Order
- AND a Payment record is linked with `status: PENDING` and `provider: "mercadopago"`

#### Scenario: SC-ORD-02 — orderNumber uniqueness
- GIVEN NanoID collision probability is negligible for 12-char alphabet
- WHEN an order is created
- THEN the `orderNumber` field is populated with a generated value
- AND the database `@unique` constraint on `orderNumber` guarantees no duplicates at the storage layer

### Requirement: REQ-ORD-02 — Order Status Lifecycle
The system SHALL support the order status lifecycle: PENDING (awaiting payment) → PAID (payment confirmed) / CANCELLED (payment rejected or expired). PROCESSING, SHIPPED, and DELIVERED states are deferred to a future release.

(Previously: statuses PENDING, PAID, CANCELLED, REFUNDED were specified — PROCESSING/SHIPPED/DELIVERED are identified but deferred)

#### Scenario: SC-ORD-03 — Payment confirmed
- GIVEN an order with status PENDING
- WHEN the payments webhook confirms payment approval (see payments delta)
- THEN order status transitions to PAID
- AND the associated Payment record status becomes APPROVED

#### Scenario: SC-ORD-04 — Payment rejected
- GIVEN an order with status PENDING
- WHEN the payments webhook confirms payment rejection
- THEN order status transitions to CANCELLED
- AND reserved stock is released (see REQ-ORD-04)

#### Scenario: SC-ORD-05 — Future lifecycle states (deferred)
- GIVEN R2 only implements PENDING → PAID / CANCELLED
- WHEN evaluating the full order lifecycle
- THEN PROCESSING, SHIPPED, DELIVERED states AND the REFUNDED state are deferred to future releases (R3/R4)
- AND the `OrderStatus` Prisma enum MAY be extended in a future migration

### Requirement: REQ-ORD-03 — Stock Reservation
The system SHALL atomically reserve stock during order creation using `prisma.$transaction` with `UPDATE Product SET stock = stock - quantity WHERE id = {id} AND stock >= quantity`.

(Previously: stock reservation was specified without atomic transaction details)

#### Scenario: SC-ORD-06 — Stock reserved atomically
- GIVEN a product has stock = 10 and the order quantity is 3
- WHEN the checkout transaction commits successfully
- THEN `Product.stock` is decremented to 7 atomically
- AND if the `WHERE stock >= quantity` condition fails (race condition), the entire transaction is rolled back

### Requirement: REQ-ORD-04 — Stock Release
The system SHALL release reserved stock when an order is cancelled or when its MercadoPago preference expires (30 min).

(Previously: stock release was specified only for cancellation — expiration cleanup is new)

#### Scenario: SC-ORD-07 — Stock released on cancellation
- GIVEN an order with status CANCELLED and 2 reserved product units
- WHEN the webhook processes a rejected payment
- THEN `Product.stock` is incremented by the reserved quantity for each OrderItem

#### Scenario: SC-ORD-08 — Stock released on preference expiration
- GIVEN a PENDING order created 31 minutes ago with reserved stock
- WHEN the next checkout Server Action runs expired preference cleanup (`$queryRaw`)
- THEN the expired order's reserved stock is released
- AND the order itself remains PENDING (no status change — only stock is freed)

### Requirement: REQ-ORD-05 — Order Detail Page
The system SHALL provide a public order detail page at `/orders/{orderNumber}` accessible by anyone with the order number. No authentication required.

(Previously: order retrieval was specified as "by ID" — now by orderNumber for public access, with full item/status/address display)

#### Scenario: SC-ORD-09 — View order by orderNumber
- GIVEN an order exists with orderNumber `V1StGXR8_Z5jd`
- WHEN a visitor navigates to `/orders/V1StGXR8_Z5jd`
- THEN the order detail page displays:
  - Order number and status badge (e.g., "Pendiente de pago", "Pagado")
  - Item list with product name, quantity, unit price (snapshot), and subtotal
  - Order total in the order's currency
  - Shipping address
  - Customer contact info (name, email)
  - Payment status
  - Creation date

#### Scenario: SC-ORD-10 — Unknown orderNumber
- GIVEN a visitor navigates to `/orders/nonexistent123`
- WHEN the order is not found in the database
- THEN a 404 page is displayed with "Pedido no encontrado"
- AND a link to the catalog is provided

## REMOVED Requirements

None. All existing requirements are preserved and enhanced. The "Manual refund" scenario (REFUNDED status) is acknowledged as deferred to future admin features (R4).

## RENAMED Requirements

None.

---

## PR Slice Mapping

| PR | Slice | Requirements |
|----|-------|-------------|
| 2 | Checkout + Orders | REQ-ORD-01, REQ-ORD-03 (order creation + stock reservation) |
| 3 | MercadoPago + Webhook | REQ-ORD-02, REQ-ORD-04 (status updates + stock release via webhook) |
| 4 | Order Display + Polish | REQ-ORD-05, REQ-ORD-07, REQ-ORD-08 (detail page, success/failure pages) |
| R3 | Customer Accounts (future) | REQ-ORD-06 (order list with auth) |
