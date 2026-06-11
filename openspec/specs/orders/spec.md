# Orders Specification

## Purpose

Order lifecycle management from creation through payment confirmation, including NanoID order numbers, atomic stock reservation and release, a public detail page accessible by order number, and success/failure return pages post-payment.

## Requirements

### Requirement: REQ-ORD-01 — Order Creation
The system SHALL create orders triggered by the checkout Server Action. Each order receives a unique NanoID 12-character `orderNumber` with no prefix. Order items store product snapshots (name, price, image at purchase time).

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

#### Scenario: SC-ORD-03 — Payment confirmed
- GIVEN an order with status PENDING
- WHEN the payments webhook confirms payment approval (see payments spec)
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

### Requirement: REQ-ORD-03 — Stock Reservation
The system SHALL atomically reserve stock during order creation using `prisma.$transaction` with `UPDATE Product SET stock = stock - quantity WHERE id = {id} AND stock >= quantity`.

#### Scenario: SC-ORD-06 — Stock reserved atomically
- GIVEN a product has stock = 10 and the order quantity is 3
- WHEN the checkout transaction commits successfully
- THEN `Product.stock` is decremented to 7 atomically
- AND if the `WHERE stock >= quantity` condition fails (race condition), the entire transaction is rolled back

### Requirement: REQ-ORD-04 — Stock Release
The system SHALL release reserved stock when an order is cancelled or when its MercadoPago preference expires (30 min).

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

### Requirement: REQ-ORD-06 — Order List (Deferred to R3)
The system SHOULD provide an order list page at `/account/orders` for authenticated customers in a future release. The data model supports it (Order.userId), but auth is out of scope for R2.

#### Scenario: SC-ORD-11 — Order list deferred
- GIVEN R2 is the current release
- WHEN evaluating order list requirements
- THEN no `/account/orders` page is implemented
- AND Order.userId field is populated with `null` for all guest orders

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

### Requirement: Order Items Snapshot
The system SHALL store product information as a snapshot at order time.

#### Scenario: Product price changes after order
- GIVEN an order was created with product price 100
- WHEN the product price is later changed to 120
- THEN the order still shows the original price of 100

### Requirement: Order History
The system SHALL maintain a history of all orders.

#### Scenario: List orders
- GIVEN orders exist
- WHEN the order list is requested
- THEN orders are displayed sorted by creation date descending
