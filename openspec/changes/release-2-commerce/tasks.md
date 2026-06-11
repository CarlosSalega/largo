# Tasks: Release 2 — Commerce

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~1360 total |
| 400-line budget risk | Medium |
| Chained PRs recommended | Yes |
| Suggested split | PR 0 → PR 1 → PR 2 → PR 3 → PR 4 |
| Delivery strategy | chained PRs — stacked-to-main |
| Chain strategy | stacked-to-main |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Add `Product.currency` + centralize `formatPrice` | PR 0 | ~30 lines, independent, merges first |
| 2 | Cart: Zustand store, CartDrawer, CartIcon, /cart page | PR 1 | ~370 lines, base=main after PR 0 |
| 3 | Checkout form wizard + atomic order creation | PR 2 | ~400 lines, base=main after PR 1 |
| 4 | MercadoPago: preference, redirect, webhook receiver | PR 3 | ~360 lines, base=main after PR 2 |
| 5 | Order display: detail page, success/failure pages | PR 4 | ~200 lines, base=main after PR 3 |

---

## PR 0 — Currency Migration (~30 lines)

### TASK-001: Add `currency` field to Product model
**PR**: 0
**Status**: pending
**Files**: `prisma/schema.prisma`
**Description**: Add `currency String @default("USD")` field to Product model. Run `prisma migrate dev` to generate migration.
**Acceptance**: `prisma validate` passes. Migration file exists in `prisma/migrations/`.
**Depends on**: none
**Estimated lines**: 2

### TASK-002: Create centralized `formatPrice` utility
**PR**: 0
**Status**: pending
**Files**: `src/lib/formatPrice.ts` (new)
**Description**: Create `formatPrice(value: number | Decimal, currency: string, locale?: string): string` using `Intl.NumberFormat`. Supports USD (`en-US`) and ARS (`es-AR`). Export `toNumber` helper.
**Acceptance**: `formatPrice(1500, "ARS")` returns `"$ 1.500,00"`. `formatPrice(49.99, "USD")` returns `"$49.99"`.
**Depends on**: none
**Estimated lines**: 20

### TASK-003: Refactor all existing `formatPrice` callers
**PR**: 0
**Status**: pending
**Files**: `src/features/product-detail/queries.ts`, `src/features/catalog/components/ProductCard.tsx`, `src/features/homepage/components/FeaturedProducts.tsx`
**Description**: Remove inline `formatPrice` definitions. Import centralized `formatPrice` from `@/lib/formatPrice`. Pass currency from product data. Update `ProductInfo.tsx` call site.
**Acceptance**: All three call sites compile. Homepage and catalog display prices correctly with USD format.
**Depends on**: TASK-002
**Estimated lines**: 15 (modify)

### TASK-004: Update seed data with currency values
**PR**: 0
**Status**: pending
**Files**: `prisma/seed.ts`
**Description**: Add `currency` field to each product in seed. Most products get `"USD"`. ARS-priced products (if any) get `"ARS"`.
**Acceptance**: `npm run db:seed` succeeds. Products in DB have `currency` populated (not null).
**Depends on**: TASK-001
**Estimated lines**: 8 (modify)

### TASK-005: Regenerate Prisma client types
**PR**: 0
**Status**: pending
**Files**: `node_modules/.prisma/client/` (generated)
**Description**: Run `prisma generate` so TypeScript sees the new `Product.currency` field.
**Acceptance**: `npm run build` compiles without errors.
**Depends on**: TASK-001
**Estimated lines**: 0 (generated)

---

## PR 1 — Cart Foundation (~370 lines)

### TASK-006: Install Zustand
**PR**: 1
**Status**: pending
**Files**: `package.json`
**Description**: `npm install zustand@5.0.9`. Zustand already at v5 — confirm `persist` middleware API.
**Acceptance**: `import { create } from "zustand"` resolves. `npm run build` succeeds.
**Depends on**: TASK-005
**Estimated lines**: 1

### TASK-007: Create Cart types
**PR**: 1
**Status**: pending
**Files**: `src/features/cart/types.ts` (new)
**Description**: Define `CartItem` (productId, name, price, currency, image, quantity, stock) and `CartState` (items, addItem, removeItem, updateQuantity, clearCart, getTotal, getItemCount, getCurrency).
**Acceptance**: Types exports compile. `CartItem` has `currency: string` field.
**Depends on**: none
**Estimated lines**: 25

### TASK-008: Create Zustand cart store with localStorage persistence
**PR**: 1
**Status**: pending
**Files**: `src/features/cart/store.ts` (new)
**Description**: Create Zustand store using `create` + `persist` middleware. localStorage key: `"largo-cart"`. Actions: `addItem` (increment if exists, else push qty=1), `removeItem`, `updateQuantity` (clamp to [0, stock]), `clearCart`. Derived: `getTotal` (sum price×qty), `getItemCount` (sum qty), `getCurrency` (items[0]?.currency or null).
**Acceptance**: Add/remove/update items in browser console. Refresh page → cart restored. New incognito → empty cart.
**Depends on**: TASK-007
**Estimated lines**: 70

### TASK-009: Implement mixed-currency guard
**PR**: 1
**Status**: pending
**Files**: `src/features/cart/store.ts` (modify), `src/features/cart/utils.ts` (new)
**Description**: In `addItem`, if `items.length > 0 && items[0].currency !== product.currency`, return error string. Caller (ProductStock) catches it and shows sonner toast: "Tu carrito tiene productos en {currency}. ¿Querés vaciar el carrito y agregar este producto en {newCurrency}?" with "Vaciar y agregar" action.
**Acceptance**: Add USD product → add ARS product → toast appears → product NOT added. Click "Vaciar y agregar" → cart cleared → ARS product added.
**Depends on**: TASK-008
**Estimated lines**: 30

### TASK-010: Create CartIcon component with badge
**PR**: 1
**Status**: pending
**Files**: `src/features/cart/components/CartIcon.tsx` (new)
**Description**: "use client". Renders `ShoppingCart` icon from lucide-react. Badge shows `getItemCount()` from store. Badge hidden when 0. Click toggles CartDrawer open state.
**Acceptance**: Icon visible in header. Badge shows correct count. Toggles drawer. Badge hidden when cart empty.
**Depends on**: TASK-008
**Estimated lines**: 30

### TASK-011: Add CartIcon to Header
**PR**: 1
**Status**: pending
**Files**: `src/components/layout/Header.tsx` (modify)
**Description**: Import CartIcon. Add it to the right side of the header, before the navigation or as a standalone element. Use flex spacing so Logo stays left, CartIcon stays right.
**Acceptance**: CartIcon renders in header on all public pages. Click opens drawer.
**Depends on**: TASK-010
**Estimated lines**: 5

### TASK-012: Create CartItem component
**PR**: 1
**Status**: pending
**Files**: `src/features/cart/components/CartItem.tsx` (new)
**Description**: "use client". Displays product image (or placeholder), name, currency + unit price via `formatPrice`, quantity increment/decrement buttons, line subtotal, remove (Trash icon). Decrement below 1 removes item. Increment checks `stock` limit.
**Acceptance**: Item rendered with correct data. +/- buttons update store. Remove button removes item.
**Depends on**: TASK-008, TASK-002
**Estimated lines**: 55

### TASK-013: Create EmptyCart component
**PR**: 1
**Status**: pending
**Files**: `src/features/cart/components/EmptyCart.tsx` (new)
**Description**: "use client". Shows shopping bag icon, "Tu carrito está vacío" message, and "Ver productos" link to `/catalog`.
**Acceptance**: Renders when cart is empty. Link navigates to catalog.
**Depends on**: none
**Estimated lines**: 15

### TASK-014: Create CartDrawer component
**PR**: 1
**Status**: pending
**Files**: `src/features/cart/components/CartDrawer.tsx` (new)
**Description**: "use client". Slide-out panel from right (Sheet-like). Contains: title "Carrito", CartItem list (or EmptyCart), CartSummary (total + "Proceed to checkout" button), close button. Uses Tailwind fixed positioning + transition. Closes on overlay click or Esc key.
**Acceptance**: Opens when CartIcon clicked. Closes on X/overlay/Esc. Shows items correctly. "Proceed to checkout" → navigates to `/checkout`.
**Depends on**: TASK-012, TASK-013
**Estimated lines**: 55

### TASK-015: Create CartSummary component
**PR**: 1
**Status**: pending
**Files**: `src/features/cart/components/CartSummary.tsx` (new)
**Description**: "use client". Shows total from `getTotal()` + `getCurrency()` via `formatPrice`. "Proceed to checkout" button (hidden when cart empty). Displays item count.
**Acceptance**: Total matches sum of line subtotals. Currency shown correctly. Button navigates to `/checkout`.
**Depends on**: TASK-008
**Estimated lines**: 25

### TASK-016: Create cart page at `/cart`
**PR**: 1
**Status**: pending
**Files**: `src/app/(public)/cart/page.tsx` (new)
**Description**: "use client". Full-page cart view: header "Carrito", CartItem list or EmptyCart, CartSummary. Includes SEO metadata (title: "Carrito | Largo", description: "carrito de compras").
**Acceptance**: `/cart` shows all cart items. Empty state with CTA. Proceed-to-checkout button works. Page title and meta correct.
**Depends on**: TASK-012, TASK-013, TASK-015
**Estimated lines**: 35

### TASK-017: Wire ProductStock "Add to cart" button
**PR**: 1
**Status**: pending
**Files**: `src/features/product-detail/components/ProductStock.tsx` (modify)
**Description**: Convert to "use client". Import `useCartStore`. On click, call `addItem` with product data (id, name, price, currency, first image, stock). Handle mixed-currency rejection with sonner toast. Disable button when `stock === 0`.
**Acceptance**: Click "Add to cart" → item appears in CartDrawer. Badge updates. Click again → quantity increments. Toast on mixed-currency.
**Depends on**: TASK-008, TASK-009, TASK-014
**Estimated lines**: 25

### TASK-018: Add hydration guard to cart components
**PR**: 1
**Status**: pending
**Files**: `src/features/cart/store.ts` (modify)
**Description**: Add `hasHydrated` state set in `useEffect`. All client components (CartIcon, CartDrawer, CartItem, /cart page) render skeleton/null until `hasHydrated` to prevent SSR mismatch with localStorage.
**Acceptance**: No hydration mismatch errors in console. Cart loads correctly on first render.
**Depends on**: TASK-008
**Estimated lines**: 15

---

## PR 2 — Checkout + Orders (~400 lines)

### TASK-019: Install form dependencies + nanoid
**PR**: 2
**Status**: pending
**Files**: `package.json`
**Description**: `npm install react-hook-form@7.57.0 @hookform/resolvers@5.0.1 zod@4.1.8 nanoid@5.1.4`
**Acceptance**: Imports resolve. `npm run build` succeeds.
**Depends on**: TASK-006
**Estimated lines**: 4

### TASK-020: Create Zod checkout schemas
**PR**: 2
**Status**: pending
**Files**: `src/features/checkout/schemas.ts` (new)
**Description**: Define `customerSchema`: `name` (min 1), `email` (email format), `phone` (optional). `shippingSchema`: `street`, `city`, `state`, `zipCode`, `country` (all required, country defaults `"Argentina"`). Compose `checkoutSchema` merging both.
**Acceptance**: Valid data passes `.parse()`. Empty name → ZodError. Invalid email → ZodError.
**Depends on**: TASK-019
**Estimated lines**: 30

### TASK-021: Create checkout types
**PR**: 2
**Status**: pending
**Files**: `src/features/checkout/types.ts` (new)
**Description**: `CheckoutFormData` combining customer + shipping. `CheckoutStep: "customer" | "shipping" | "review"`. `CheckoutState` for wizard.
**Acceptance**: Types compile. `CheckoutStep` union restricts to 3 valid values.
**Depends on**: none
**Estimated lines**: 12

### TASK-022: Create CustomerStep component
**PR**: 2
**Status**: pending
**Files**: `src/features/checkout/components/CustomerStep.tsx` (new)
**Description**: "use client". `react-hook-form` fields for `name` (input), `email` (input type=email), `phone` (input type=tel, optional). Zod resolver via `@hookform/resolvers/zod`. Labels/placeholders in Spanish. "Continuar" button advances to shipping step.
**Acceptance**: Fill fields → click Continuar → validated → advances. Empty name → inline error. Bad email → inline error.
**Depends on**: TASK-020
**Estimated lines**: 40

### TASK-023: Create ShippingStep component
**PR**: 2
**Status**: pending
**Files**: `src/features/checkout/components/ShippingStep.tsx` (new)
**Description**: "use client". Fields: `street`, `city`, `state`, `zipCode`, `country` (default "Argentina"). Zod validation. "Volver" (back to customer) and "Continuar" (advance to review) buttons. Form data preserved when going back.
**Acceptance**: Fill fields → validated → advances. Empty required → inline error. Back preserves CustomerStep data.
**Depends on**: TASK-020, TASK-022
**Estimated lines**: 45

### TASK-024: Create OrderSummary component (checkout review)
**PR**: 2
**Status**: pending
**Files**: `src/features/checkout/components/OrderSummary.tsx` (new)
**Description**: "use client". Read-only. Lists each cart item (name, qty, unit price with currency via formatPrice, line subtotal). Shows cart total at bottom. "Confirmar pedido" button triggers `confirmCheckout` Server Action.
**Acceptance**: Items match cart store. Totals correct. Currency displayed correctly.
**Depends on**: TASK-008
**Estimated lines**: 40

### TASK-025: Create ReviewStep component
**PR**: 2
**Status**: pending
**Files**: `src/features/checkout/components/ReviewStep.tsx` (new)
**Description**: "use client". Shows: customer info summary (name, email, phone), shipping address summary, OrderSummary. "Volver" button (back to shipping). "Confirmar pedido" triggers Server Action. Loading state while tx pending. Error message display.
**Acceptance**: All data from previous steps visible. Confirm triggers action. Loading spinner shown. Errors displayed inline.
**Depends on**: TASK-024
**Estimated lines**: 35

### TASK-026: Create CheckoutForm wizard
**PR**: 2
**Status**: pending
**Files**: `src/features/checkout/components/CheckoutForm.tsx` (new)
**Description**: "use client". Manages `currentStep: CheckoutStep`. Step indicator at top showing progress (1/3 → Customer, 2/3 → Shipping, 3/3 → Review). Renders CustomerStep, ShippingStep, or ReviewStep based on state. `react-hook-form` `FormProvider` wrapping all steps so data persists across navigation.
**Acceptance**: Navigate 1→2→3 and back. Data preserved when going back. Step indicator updates.
**Depends on**: TASK-022, TASK-023, TASK-025
**Estimated lines**: 45

### TASK-027: Implement `generateOrderNumber`
**PR**: 2
**Status**: pending
**Files**: `src/features/checkout/actions.ts` (new)
**Description**: Use `nanoid(12)` to generate 12-char order number. In `confirmCheckout`, retry on `P2002` unique constraint (max 3 retries).
**Acceptance**: Generated string is 12 chars, URL-safe. No prefix. Retry logic handles collision.
**Depends on**: TASK-019
**Estimated lines**: 15

### TASK-028: Implement `releaseExpiredStock`
**PR**: 2
**Status**: pending
**Files**: `src/features/checkout/actions.ts` (modify)
**Description**: Inside `confirmCheckout` transaction, run `$queryRaw`: `UPDATE Product SET stock = stock + oi.quantity FROM OrderItem oi JOIN "Order" o ON oi.orderId = o.id WHERE o.status = 'PENDING' AND o.createdAt < NOW() - INTERVAL '30 minutes' AND oi.productId = Product.id`. Stock released from expired PENDING orders. Orders stay PENDING.
**Acceptance**: Create PENDING order, wait (or manually set createdAt), run cleanup → stock restored.
**Depends on**: TASK-027
**Estimated lines**: 20

### TASK-029: Implement `confirmCheckout` Server Action
**PR**: 2
**Status**: pending
**Files**: `src/features/checkout/actions.ts` (modify)
**Description**: "use server". Input: `{ customer, shipping, cartItems }`. Steps inside `prisma.$transaction`: (1) Validate stock: `SELECT stock FROM Product WHERE id IN (...)` — reject if any < quantity. (2) `releaseExpiredStock`. (3) INSERT Order (orderNumber via nanoid, status PENDING, customer fields, subtotal, total, userId=null). (4) INSERT OrderItem[] (productId, productName, productPrice, productImage, quantity, subtotal). (5) INSERT Address. (6) INSERT Payment (status PENDING, provider "mercadopago", amount=total, currency from cart). (7) UPDATE Product SET stock = stock - qty WHERE id=? AND stock >= qty (per item). Return `{ orderId, orderNumber }`. Catch errors → return `{ error }`.
**Acceptance**: Valid checkout → Order + Items + Address + Payment in DB. Stock decremented. Cart NOT cleared server-side (client calls clearCart on success). Race condition → transaction rolls back → error returned.
**Depends on**: TASK-027, TASK-028
**Estimated lines**: 80

### TASK-030: Create checkout page at `/checkout`
**PR**: 2
**Status**: pending
**Files**: `src/app/(public)/checkout/page.tsx` (new)
**Description**: Server component wrapper. Client component inside reads cart. If cart empty → `redirect("/cart")` with sonner toast "Agregá productos al carrito antes de continuar". Otherwise renders CheckoutForm.
**Acceptance**: `/checkout` with items → shows form. `/checkout` empty → redirects to `/cart`.
**Depends on**: TASK-026, TASK-029
**Estimated lines**: 20

### TASK-031: Create success page placeholder
**PR**: 2
**Status**: pending
**Files**: `src/app/(public)/checkout/success/page.tsx` (new)
**Description**: Server component. Reads `searchParams.orderNumber`. Shows "¡Pedido confirmado!" heading, order number, static "Pago recibido" message. Full order data wired in PR 4. Sets `noindex` meta.
**Acceptance**: `/checkout/success?orderNumber=xxx` shows confirmation. Page title: "Pedido confirmado | Largo".
**Depends on**: none
**Estimated lines**: 20

### TASK-032: Create failure page placeholder
**PR**: 2
**Status**: pending
**Files**: `src/app/(public)/checkout/failure/page.tsx` (new)
**Description**: Server component. Shows "El pago no pudo ser procesado", order number from `searchParams`. Static "Volver al carrito" link. Retry button wired in PR 4.
**Acceptance**: `/checkout/failure?orderNumber=xxx` shows failure message. Link back to cart works.
**Depends on**: none
**Estimated lines**: 18

---

## PR 3 — MercadoPago + Webhook (~360 lines)

### TASK-033: Install MercadoPago SDK
**PR**: 3
**Status**: pending
**Files**: `package.json`
**Description**: `npm install mercadopago@2.4.1`
**Acceptance**: `import { MercadoPagoConfig, Preference, Payment } from "mercadopago"` resolves.
**Depends on**: TASK-019
**Estimated lines**: 1

### TASK-034: Create MercadoPago client singleton
**PR**: 3
**Status**: pending
**Files**: `src/lib/mercadopago/client.ts` (new)
**Description**: Initialize `MercadoPagoConfig` with `accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!`. Export singleton `mpClient`.
**Acceptance**: Import works. Config instance created. Token read from env.
**Depends on**: TASK-033
**Estimated lines**: 8

### TASK-035: Implement `createPreference`
**PR**: 3
**Status**: pending
**Files**: `src/features/payments/mercadopago.ts` (new)
**Description**: Export `createPreference(order, cartItems, currency)`. Uses `new Preference(mpClient).create({ body: { items: cartItems mapped to MP format, metadata: { orderId, orderNumber }, back_urls: { success, failure, pending }, auto_return: "approved", expires: true, expiration_date_to: now + 30min } })`. `Payment.currency` overridden with cart currency. On success: update `Payment.providerPreferenceId` in DB, return `{ init_point }`. On failure: return `{ error }`.
**Acceptance**: With valid test token, preference created → `init_point` returned. Metadata stored. `providerPreferenceId` saved.
**Depends on**: TASK-034
**Estimated lines**: 55

### TASK-036: Implement `getPayment` from MP API
**PR**: 3
**Status**: pending
**Files**: `src/features/payments/mercadopago.ts` (modify)
**Description**: Export `getMPPayment(paymentId)`. Uses `new Payment(mpClient).get({ id: paymentId })`. Returns MP payment response with `status` field.
**Acceptance**: With valid payment ID, returns MP payment object.
**Depends on**: TASK-034
**Estimated lines**: 10

### TASK-037: Integrate `createPreference` into checkout flow
**PR**: 3
**Status**: pending
**Files**: `src/features/checkout/actions.ts` (modify), `src/app/(public)/checkout/page.tsx` (modify)
**Description**: After `confirmCheckout` transaction succeeds, call `createPreference`. Return `{ init_point, orderNumber }` to client. Client-side: `window.location.href = init_point` for MP redirect.
**Acceptance**: Click "Confirmar pedido" → redirected to MercadoPago hosted checkout. Items visible in MP.
**Depends on**: TASK-029, TASK-035
**Estimated lines**: 20

### TASK-038: Implement webhook signature validation
**PR**: 3
**Status**: pending
**Files**: `src/features/payments/utils.ts` (new)
**Description**: Export `validateSignature(body, xSignature, xRequestId, secret)`. Computes HMAC-SHA256: `crypto.createHmac("sha256", secret).update("id:{data.id};request-id:{x-request-id}").digest("hex")`. Compares with provided signature.
**Acceptance**: Valid signature → returns true. Invalid → returns false. Tampered body → mismatch.
**Depends on**: none
**Estimated lines**: 20

### TASK-039: Create webhook route handler
**PR**: 3
**Status**: pending
**Files**: `src/app/api/webhooks/mercadopago/route.ts` (new)
**Description**: `POST` handler with `runtime = "nodejs"`. Flow: (1) Read headers (`x-signature`, `x-request-id`). (2) Validate signature → 401 if invalid. (3) Parse body → extract `eventId`, `data.id` (payment ID). (4) Idempotency: `prisma.webhookEvent.create({ data: { eventId, type, payload } })` → catch `P2002` → return 200. (5) Call `getMPPayment(data.id)`. (6) Find Payment by `providerPreferenceId` (MP payment has `order.id` in metadata or match by payment ID). (7) Map status: `approved` → Order→PAID, Payment→APPROVED, Payment.paidAt=now(); `rejected`/`cancelled` → Order→CANCELLED, Payment→REJECTED, release stock. (8) Mark `WebhookEvent.processed = true`. (9) Return 200.
**Acceptance**: Simulated webhook POST → 200. Duplicate eventId → 200 idempotent. Bad signature → 401. Unknown payment → 404.
**Depends on**: TASK-036, TASK-038
**Estimated lines**: 70

### TASK-040: Implement stock release on cancellation
**PR**: 3
**Status**: pending
**Files**: `src/features/orders/queries.ts` (new)
**Description**: Export `releaseStock(orderId)`. Within `prisma.$transaction`: `UPDATE Product SET stock = stock + oi.quantity FROM OrderItem oi WHERE oi.orderId = orderId AND oi.productId = Product.id`. Called from webhook on rejected/cancelled payment.
**Acceptance**: Cancelled order → stock restored. Called once → stock incremented correctly.
**Depends on**: TASK-039
**Estimated lines**: 15

### TASK-041: Add MercadoPago env vars to `.env.example`
**PR**: 3
**Status**: pending
**Files**: `.env.example`
**Description**: Add: `MERCADOPAGO_ACCESS_TOKEN=TEST-...`, `MERCADOPAGO_WEBHOOK_SECRET=`, `NEXT_PUBLIC_SITE_URL=http://localhost:3000`
**Acceptance**: `.env.example` includes all three vars with placeholder values and comments.
**Depends on**: none
**Estimated lines**: 6

### TASK-042: Handle webhook `not_found` payment scenario
**PR**: 3
**Status**: pending
**Files**: `src/app/api/webhooks/mercadopago/route.ts` (modify)
**Description**: If `getMPPayment` returns 404 or no payment found, return 404 to MP. If payment found but no matching Payment record in DB (by MP payment's external_reference metadata), return 404.
**Acceptance**: Stale/malformed webhook → 404. MP retries without side effects.
**Depends on**: TASK-039
**Estimated lines**: 15

---

## PR 4 — Order Display + Polish (~200 lines)

### TASK-043: Implement `getOrderByNumber` query
**PR**: 4
**Status**: pending
**Files**: `src/features/orders/queries.ts` (modify)
**Description**: Export `getOrderByNumber(orderNumber)`. Queries `db.order.findUnique({ where: { orderNumber }, include: { items: true, address: true, payment: true } })`. Returns null if not found.
**Acceptance**: Returns full order with items, address, payment for valid orderNumber. Returns null for nonexistent.
**Depends on**: none
**Estimated lines**: 15

### TASK-044: Create OrderStatusBadge component
**PR**: 4
**Status**: pending
**Files**: `src/features/orders/components/OrderStatusBadge.tsx` (new)
**Description**: "use client". Maps `OrderStatus` → Spanish label + color badge. PENDING → "Pendiente de pago" (amber), PAID → "Pagado" (emerald), CANCELLED → "Cancelado" (destructive), REFUNDED → "Reembolsado" (slate).
**Acceptance**: Renders correct color and label for each status.
**Depends on**: none
**Estimated lines**: 25

### TASK-045: Create OrderDetail component
**PR**: 4
**Status**: pending
**Files**: `src/features/orders/components/OrderDetail.tsx` (new)
**Description**: Server component. Receives full Order with items, address, payment. Displays: orderNumber + status badge, item list (productName, qty, productPrice snapshot via formatPrice, subtotal), total with currency, shipping address, customer info (name, email), payment status, creation date.
**Acceptance**: All order data rendered correctly. Currency formatted. Status badge correct.
**Depends on**: TASK-044, TASK-002
**Estimated lines**: 55

### TASK-046: Create public order detail page
**PR**: 4
**Status**: pending
**Files**: `src/app/(public)/orders/[orderNumber]/page.tsx` (new)
**Description**: Server component. `params.orderNumber` → `getOrderByNumber`. If null → `notFound()`. Otherwise renders OrderDetail. Sets metadata: title "Pedido {orderNumber} | Largo", `noindex`.
**Acceptance**: `/orders/V1StGXR8_Z5jd` shows full order. `/orders/nonexistent` → 404 page.
**Depends on**: TASK-043, TASK-045
**Estimated lines**: 25

### TASK-047: Wire success page with real order data
**PR**: 4
**Status**: pending
**Files**: `src/app/(public)/checkout/success/page.tsx` (modify)
**Description**: Replace placeholder with `searchParams.orderNumber` → `getOrderByNumber`. Show: "¡Pedido confirmado!" heading, order number, OrderDetail summary (items, total), status ("Pago recibido — estamos procesando tu pedido"). Link "Seguir comprando" → `/catalog`. Preserve `noindex`.
**Acceptance**: After MP redirect, success page shows real order. Order number matches. Items displayed.
**Depends on**: TASK-043, TASK-045
**Estimated lines**: 25

### TASK-048: Wire failure page with retry option
**PR**: 4
**Status**: pending
**Files**: `src/app/(public)/checkout/failure/page.tsx` (modify)
**Description**: Replace placeholder. Read `searchParams.orderNumber` → `getOrderByNumber`. Show: "El pago no pudo ser procesado", order number, order summary. "Reintentar pago" button calls `createPreference` for this order (Server Action). "Volver al carrito" link. For expired preference, show "La sesión de pago expiró".
**Acceptance**: Failure page shows real order. Retry creates new preference. Redirect to MP works.
**Depends on**: TASK-043, TASK-045, TASK-035
**Estimated lines**: 35

### TASK-049: Add SEO metadata to order pages
**PR**: 4
**Status**: pending
**Files**: `src/app/(public)/orders/[orderNumber]/page.tsx` (modify), `src/app/(public)/checkout/success/page.tsx` (modify), `src/app/(public)/checkout/failure/page.tsx` (modify)
**Description**: All order-related pages: set `robots: "noindex, nofollow"`. Dynamic metadata for order detail page (title includes orderNumber). Ensure description tags present.
**Acceptance**: `noindex` meta on all 3 pages. Order detail page title dynamic.
**Depends on**: TASK-046, TASK-047, TASK-048
**Estimated lines**: 8

---

## Summary

| PR | Tasks | Lines | Focus |
|----|-------|-------|-------|
| 0 | TASK-001–005 | ~45 | Currency field + formatPrice refactor |
| 1 | TASK-006–018 | ~370 | Zustand cart, CartDrawer, CartIcon, /cart page |
| 2 | TASK-019–032 | ~410 | Checkout wizard, atomic order creation, stock reservation |
| 3 | TASK-033–042 | ~360 | MercadoPago SDK, preference, webhook, signature validation |
| 4 | TASK-043–049 | ~195 | Order detail page, success/failure pages, SEO |
| **Total** | **49 tasks** | **~1380** | Complete commerce pipeline |

### Dependencies (simplified graph)

```
PR 0 (TASK-001–005) ──┐
                       ├──▶ PR 1 (TASK-006–018) ──▶ PR 2 (TASK-019–032) ──▶ PR 3 (TASK-033–042) ──▶ PR 4 (TASK-043–049)
                       │
                       (PR 0 merges first; each subsequent PR stacks onto main after previous merges)
```

### R1 Integration Points

| Task | R1 File | Change |
|------|---------|--------|
| TASK-011 | `src/components/layout/Header.tsx` | Add CartIcon to existing header |
| TASK-017 | `src/features/product-detail/components/ProductStock.tsx` | Wire no-op button to cart store |
| TASK-003 | `src/features/product-detail/queries.ts` | Remove inline formatPrice, import centralized |
| TASK-003 | `src/features/catalog/components/ProductCard.tsx` | Same as above |
| TASK-003 | `src/features/homepage/components/FeaturedProducts.tsx` | Same as above |
| TASK-016 | `src/app/(public)/layout.tsx` | Cart page uses same layout (no change needed) |

### Deferred to Post-MVP

- User authentication / account system
- Admin panel (product/category/order management)
- Shipping cost calculation
- Discount codes / coupons
- Product variants
- Email notifications
- `next/image` migration
- Automated tests (Vitest/Playwright)
- Order list (`/account/orders`)
- PROCESSING/SHIPPED/DELIVERED order statuses
- Mixed-currency cart support
