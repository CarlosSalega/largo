# Design: Release 2 — Commerce

## Technical Approach

Wire the non-functional "Add to cart" button into a complete MercadoPago Checkout Pro pipeline: client-side cart (Zustand + localStorage) → multi-step checkout form → atomic order creation (Server Action + `prisma.$transaction`) → MP preference redirect → webhook receiver with signature validation and idempotency → order status sync.

All data stays client-side until order creation, then everything is DB-backed. No auth — guest checkout only.

## Architecture Overview

```
Cart (Zustand/locStorage)          Checkout (Server Action)          MercadoPago (external)
┌──────────┐  add/remove  ┌───────────────────────┐  redirect  ┌──────────────────────┐
│ Client   │──────────────▶│ confirmCheckout()      │───────────▶│ init_point (hosted)  │
│ State    │               │ 1. validateStock()      │            │ user pays...         │
└──────────┘               │ 2. $transaction:        │            └──────────┬───────────┘
       │                   │    Order+Items+Address  │                       │ webhook POST
       │                   │    +Payment+stock-=qty  │                       ▼
       ▼                   │ 3. createPreference()   │            ┌──────────────────────┐
  CartDrawer/CartPage      │ 4. return init_point    │            │ /api/webhooks/mp     │
                           └────────────────────────┘            │ validate x-signature  │
                                                                 │ idempotency (eventId) │
                                                                 │ re-query MP API       │
                                                                 │ Order→PAID/CANCELLED  │
                                                                 └──────────────────────┘
```

**State boundaries**: Cart = client (localStorage). Order/Address/Payment = server (Prisma/PostgreSQL). Preference = MP API.

**Security**: All Server Actions run on server. Webhook is a public POST endpoint validated via `x-signature` HMAC. No auth on any route.

## Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Cart state | Zustand + localStorage middleware | Minimal bundle (~2KB), persists across refresh, no server round-trips |
| Order creation | Single `prisma.$transaction` with `WHERE stock >= quantity` | Atomicity prevents overselling. Conditional update fails entire tx on race |
| orderNumber | NanoID 12-char, no prefix | Short, URL-safe, collision negligible at 1M IDs/day over 30 years |
| MP SDK | `mercadopago` npm, singleton `MercadoPagoConfig` | Official, typed, proven pattern from goncy/next-mercadopago |
| Webhook dedup | `WebhookEvent.eventId @unique` → catch `P2002` | DB-level guarantee, no distributed locks needed |
| Preference timeout | 30 min, cleanup at next checkout via `$queryRaw` | No cron needed; lightweight — only runs when someone checks out |
| Currency | Per-product `Product.currency`, `formatPrice(locale, currency)` | Mixed-currency carts forbidden. Display follows locale per currency |

## File Structure

### PR 0 — Currency Migration (~30 lines)
| File | Action |
|------|--------|
| `prisma/schema.prisma` | Modify: add `currency String @default("USD")` to Product |
| `prisma/migrations/` | Create: migration file |
| `src/lib/formatPrice.ts` | Create: `formatPrice(value, currency, locale)` with `Intl.NumberFormat` |
| `src/features/product-detail/queries.ts` | Modify: remove inline `formatPrice`, re-export from `@/lib/formatPrice` |

### PR 1 — Cart Foundation (~370 lines)
```
src/features/cart/
├── store.ts              # Create: Zustand store + localStorage persist
├── types.ts              # Create: CartItem, CartState
├── utils.ts              # Create: isMixedCurrency, cartCurrency, clearCart
└── components/
    ├── CartDrawer.tsx     # Create: "use client", slide-out sheet
    ├── CartIcon.tsx       # Create: "use client", Lucide ShoppingCart + badge
    ├── CartItem.tsx       # Create: "use client", qty controls, remove
    └── EmptyCart.tsx      # Create: "use client", empty state
src/app/(public)/cart/
└── page.tsx              # Create: full cart page (client component)
src/components/layout/Header.tsx      # Modify: add CartIcon
src/features/product-detail/components/ProductStock.tsx  # Modify: wire button↔store
package.json              # Add: zustand "5.0.9"
```

### PR 2 — Checkout + Order Creation (~400 lines)
```
src/features/checkout/
├── actions.ts            # Create: "use server" confirmCheckout()
├── schemas.ts            # Create: Zod customerSchema, shippingSchema, checkoutSchema
├── types.ts              # Create: CheckoutFormData
└── components/
    ├── CheckoutForm.tsx   # Create: multi-step wizard ("use client")
    ├── CustomerStep.tsx
    ├── ShippingStep.tsx
    ├── ReviewStep.tsx
    └── OrderSummary.tsx
src/app/(public)/checkout/
├── page.tsx              # Create: wrapper, reads cart, empty→redirect
├── success/page.tsx      # Create: placeholder
└── failure/page.tsx      # Create: placeholder
package.json              # Add: react-hook-form "7.57.0", @hookform/resolvers "5.0.1", zod "4.1.8", nanoid "5.1.4"
```

### PR 3 — MercadoPago + Webhook (~360 lines)
```
src/lib/mercadopago/
└── client.ts             # Create: MP singleton, MercadoPagoConfig
src/features/payments/
├── mercadopago.ts         # Create: createPreference(order), getPayment(id)
├── webhook.ts            # Create: processWebhook(body, signature, requestId)
├── types.ts              # Create: MP types
└── utils.ts              # Create: buildPreferenceItems, validateSignature
src/app/api/webhooks/mercadopago/
└── route.ts              # Create: POST handler, runtime="nodejs"
src/features/checkout/actions.ts      # Modify: integrate createPreference after tx
.env.example              # Add: MERCADOPAGO_ACCESS_TOKEN, MP_WEBHOOK_SECRET, NEXT_PUBLIC_SITE_URL
package.json              # Add: mercadopago "2.4.1"
```

### PR 4 — Order Display + Polish (~200 lines)
```
src/features/orders/
├── queries.ts            # Create: getOrderByNumber(orderNumber)
├── types.ts
└── components/
    ├── OrderDetail.tsx    # Create: full order view
    └── OrderStatusBadge.tsx
src/app/(public)/orders/[orderNumber]/
└── page.tsx              # Create: public order detail, 404 notFound
src/app/(public)/checkout/success/page.tsx  # Modify: show real order from query param
src/app/(public)/checkout/failure/page.tsx  # Modify: retry/create new preference
```

## Component Tree & Data Flow

```
/cart (Client Component)
  CartPage ← useCartStore() (Zustand)
    ├─ CartItem[] → CartItem (qty±, remove → store actions)
    ├─ CartSummary (total ← store.getTotal())
    └─ Button "Proceed" → router.push("/checkout")

/checkout (Client Component wrapped in Server Component)
  Server: reads cart (can't — cart is client-only; guard in client)
  CheckoutForm ← useForm<CheckoutFormData> (react-hook-form + zod)
    Step 1: CustomerStep (name, email, phone)
    Step 2: ShippingStep (street, city, state, zip, country="Argentina")
    Step 3: ReviewStep
      OrderSummary ← useCartStore() (read-only)
      Button "Confirm" → confirmCheckout(FormData, cartItems) [Server Action]
        ↓ returns { init_point: string }
        ↓ client: window.location.href = init_point

/api/webhooks/mercadopago (Route Handler, runtime="nodejs")
  POST body: { action, data: { id }, ... }
  headers: x-signature, x-request-id
  → validateSignature(body, signature, requestId)
  → upsert WebhookEvent (eventId @unique)
  → catch P2002 → 200 (idempotent)
  → Payment(mercadopago).get({ id: body.data.id })
  → if approved: Order→PAID, Payment→APPROVED
  → if rejected: Order→CANCELLED, releaseStock()
  → 200

/orders/[orderNumber] (Server Component)
  getOrderByNumber(orderNumber) → Order + items + address + payment
  → 404 if null
  → OrderDetail (status, items, total, address)
```

## Zustand Store Design

```ts
// src/features/cart/store.ts
interface CartItem {
  productId: string;
  name: string;
  price: number;
  currency: string;       // "USD" | "ARS"
  image: string | null;
  quantity: number;
  stock: number;           // server-side stock at add time
}

interface CartState {
  items: CartItem[];
  addItem: (product: ProductCartInfo, qty?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, qty: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
  getCurrency: () => string | null; // null if empty
}

// Persist middleware: localStorage key "largo-cart"
// Hydration: useCartStore uses useEffect to set `hasHydrated` flag
// Components render skeleton until hydrated to avoid SSR mismatch
```

**Mixed-currency guard**: `addItem` checks `items[0].currency !== product.currency`. If mismatch, returns an error string. The caller (ProductStock) shows a toast via `sonner` and offers "Clear cart and add".

## Server Action: confirmCheckout

```ts
// Input (client sends)
{ customer: CustomerSchema, shipping: ShippingSchema, cartItems: CartItem[] }

// Transaction steps (prisma.$transaction):
// 1. Validate stock: SELECT stock FROM Product WHERE id IN (...)
// 2. Reject if any stock < quantity → throw "Producto agotado"
// 3. Cleanup expired: $queryRaw UPDATE Product SET stock = stock + oi.quantity
//    FROM OrderItem oi JOIN "Order" o ON ... WHERE o.status=PENDING AND o.createdAt < now()-30min
// 4. INSERT Order (orderNumber=NanoID, status=PENDING, ...)
// 5. INSERT OrderItem[] (product snapshots)
// 6. INSERT Address
// 7. INSERT Payment (status=PENDING, provider="mercadopago")
// 8. UPDATE Product SET stock = stock - quantity WHERE id=? AND stock >= quantity
// 9. Return { orderId, orderNumber }

// After transaction (outside tx):
// 10. createPreference(order) → store providerPreferenceId in Payment
// 11. Return { init_point, orderNumber }
```

**Error handling**: Prisma errors caught in try/catch. `P2002` (unique orderNumber) → retry NanoID. Stock `WHERE` fails → "Producto agotado". MP API fails → "Error al conectar con MercadoPago". Transaction rollback preserves cart.

## Webhook: POST /api/webhooks/mercadopago

```
Flow:
1. Read headers: x-signature, x-request-id
2. Compute: crypto.createHmac("sha256", MP_WEBHOOK_SECRET).update("id:{data.id};request-id:{x-request-id}").digest("hex")
3. If signature mismatch → 401
4. Extract eventId from body (body.id or body.data.id)
5. INSERT WebhookEvent { eventId, type, payload }  → catch P2002 → 200 (dedup)
6. const payment = await new Payment(mpClient).get({ id: body.data.id })
7. Map payment.status:
   - "approved"  → Order→PAID, Payment→APPROVED, Payment.paidAt=now()
   - "rejected"  → Order→CANCELLED, Payment→REJECTED, releaseStock()
   - "cancelled" → Order→CANCELLED, Payment→REJECTED, releaseStock()
8. revalidatePath("/orders/" + orderNumber)
9. Return 200
```

Response codes: 200 (success + idempotent dedup), 400 (bad body), 401 (bad signature), 500 (DB failure).

## MercadoPago Integration

```ts
// src/lib/mercadopago/client.ts
import { MercadoPagoConfig } from "mercadopago";
export const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

// Preference creation (src/features/payments/mercadopago.ts):
new Preference(mpClient).create({
  body: {
    items: order.items.map(item => ({
      id: item.productId,
      title: item.productName,
      unit_price: Number(item.productPrice),
      quantity: item.quantity,
      currency_id: paymentCurrency, // from cart
    })),
    metadata: { orderId: order.id, orderNumber: order.orderNumber },
    back_urls: {
      success: `${SITE_URL}/checkout/success?orderNumber=${order.orderNumber}`,
      failure: `${SITE_URL}/checkout/failure?orderNumber=${order.orderNumber}`,
    },
    auto_return: "approved",
    expires: true,
    expiration_date_to: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  },
});
```

## Database Queries

| Query | Location | Purpose |
|-------|----------|---------|
| `getProductCartInfo(id)` | `cart/queries.ts` | Fetch product name, price, currency, stock, first image for add-to-cart |
| `getCartProducts(ids[])` | `checkout/queries.ts` | Validate stock + price before order creation |
| `releaseExpiredStock()` | `checkout/queries.ts` | `$queryRaw` to release stock from orders >30min PENDING |
| `getOrderByNumber(orderNumber)` | `orders/queries.ts` | Public order detail with items, address, payment |
| `updateOrderStatus(id, status)` | `orders/queries.ts` | Status transition in webhook |

Existing Prisma models are sufficient. No new models needed. `Payment.currency` default matches per-product currency at preference time.

## Route Design

| Route | Type | C/S | Notes |
|-------|------|-----|-------|
| `/cart` | Page | Client | Reads Zustand. Empty redirect not needed (stays on page) |
| `/checkout` | Page | Hybrid | Server wrapper, client form. Redirects to `/cart` if cart empty |
| `/checkout/success` | Page | Server | `searchParams.orderNumber` → getOrderByNumber. Noindex |
| `/checkout/failure` | Page | Server | `searchParams.orderNumber`. Retry button (new preference) |
| `/orders/[orderNumber]` | Page | Server | `getOrderByNumber`. 404 if not found. Noindex |
| `/api/webhooks/mercadopago` | Route | Server | `runtime="nodejs"`. POST only. |

## PR Slice Boundaries

| PR | Depends | Deliverable | Files (+/-) |
|----|---------|-------------|-------------|
| **0** | — | `Product.currency`, `formatPrice` refactored, seed updated | 3 new, 2 modify |
| **1** | 0 | Full cart: add/remove/qty, persistence, CartDrawer, CartIcon, CartPage, mixed-currency guard | 10 new, 3 modify |
| **2** | 1 | Checkout form wizard, Zod validation, atomic order creation, stock reservation | 11 new, 2 modify |
| **3** | 2 | MP SDK, preference creation, redirect, webhook receiver with signature validation | 8 new, 3 modify |
| **4** | 3 | Order detail page, success/failure pages with real data, polish | 5 new, 2 modify |

**Merge order**: 0 → 1 → 2 → 3 → 4 (stacked to main). Each PR is independently verifiable. PR 1 tests: add/remove items, refresh persistence. PR 2 tests: form validation, order appears in DB. PR 3 tests: MP redirect, webhook processes payment. PR 4 tests: detail page renders.

## Dependencies

| Package | Version | PR | Purpose |
|---------|---------|-----|---------|
| `zustand` | 5.0.9 | 1 | Client cart state |
| `nanoid` | 5.1.4 | 2 | orderNumber generation |
| `react-hook-form` | 7.57.0 | 2 | Checkout form state |
| `@hookform/resolvers` | 5.0.1 | 2 | Zod↔RHF integration |
| `zod` | 4.1.8 | 2 | Form + Server Action validation |
| `mercadopago` | 2.4.1 | 3 | MP SDK (Preference, Payment, MercadoPagoConfig) |

Existing dependency `sonner` (2.0.7) used for toast notifications (mixed-currency warning, errors).

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit | `formatPrice`, `isMixedCurrency`, `cartCurrency`, `generateOrderNumber`, `validateSignature` | Vitest, pure functions |
| Unit | Zustand store actions | Zustand `createStore` in test without persist |
| Integration | `confirmCheckout` Server Action | Test DB, verify Order+Items+Address+Payment+stock decrement |
| Integration | Webhook handler | Simulate POST with valid/invalid signature, duplicate eventId |
| E2E | Full flow: cart→checkout→MP redirect (mocked)→webhook→order detail | Playwright (future) or curl simulation |

## Migration

One Prisma migration in PR 0: add `currency String @default("USD")` to Product model. Non-nullable with default — existing products automatically get "USD". Seed updated to set `currency: "ARS"` for ARS-priced products.

## Open Questions

- [ ] `MP_WEBHOOK_SECRET` exact format — MP docs say `HMAC-SHA256` using the secret configured in dashboard. Signature formula to verify against real MP webhook during dev.
- [ ] `sonner` toasts vs custom modal for mixed-currency warning — sonner preferred for consistency; confirm with team.
- [ ] `Payment.currency` default "ARS" — should match cart currency at preference time. Override at creation.
- [ ] Should `releaseExpiredStock` also mark those orders as CANCELLED? Proposal says no (remain PENDING), but spec calls it "cleanup". Current design: stock released, order stays PENDING. Confirm.
