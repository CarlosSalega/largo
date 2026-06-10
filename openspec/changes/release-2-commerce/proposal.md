# Proposal: Release 2 — Commerce

## Intent

Complete the ecommerce purchase flow: cart → checkout → payment → order confirmation. R1 delivered a browsable storefront with a non-functional "Add to cart" button. R2 wires that button into a full commerce pipeline using MercadoPago Checkout Pro for payments.

## Scope

### In Scope
- **Cart**: Zustand + localStorage — add/remove/update items, persistence, totals, empty state, CartDrawer, CartIcon with badge
- **Checkout**: Multi-step form (customer → shipping → confirm), Zod validation, Server Action with `prisma.$transaction` for atomic order creation + stock reservation
- **Payments**: MercadoPago Checkout Pro — preference creation, redirect, webhook receiver with signature validation + idempotency
- **Orders**: Status lifecycle (PENDING → PAID/CANCELLED), public order detail page, success/failure return pages
- **Pre-R2 schema PR**: Add `currency` field to Product, refactor `formatPrice` to accept currency parameter

### Out of Scope
- Mixed-currency carts (forbidden — warn and offer to clear cart)
- Auth, Customer Dashboard (R3), Admin panel (R4)
- Shipping costs, coupons, product variants

## Approach

- **Cart**: Client-side only via Zustand + localStorage. No server round-trips on add/remove.
- **Checkout**: Server Action validates stock atomically (`prisma.$transaction` with `WHERE stock >= quantity`), creates Order + OrderItems + Address + Payment in one write.
- **Payments**: MercadoPago SDK (`mercadopago` npm). Create `Preference` with `metadata: { orderId, orderNumber }`, redirect to `init_point`. Webhook at `POST /api/webhooks/mercadopago` re-queries MP API for payment status.
- **Idempotency**: `WebhookEvent.eventId @unique` prevents duplicate processing.
- **Preference timeout**: 30 min. Checkout-time cleanup via `$queryRaw` releases expired PENDING orders' stock. No cron.

## Domain Breakdown

| Domain | Key Decision |
|--------|-------------|
| Cart | Zustand + localStorage, no DB persistence |
| Checkout | Server Action + `$transaction`, Zod multi-step form |
| Orders | NanoID 12-char `orderNumber`, item snapshots via OrderItem |
| Payments | MP SDK with `metadata` pattern from goncy/next-mercadopago |
| Product | `currency` field added pre-R2 (schema-only migration) |

## Slice Strategy

| PR | Name | Lines | Depends | Deliverable |
|----|------|-------|---------|-------------|
| 0 | Currency Migration | ~30 | — | `Product.currency`, `formatPrice` refactor, seed update |
| 1 | Cart Foundation | ~370 | PR 0 | CartDrawer, CartIcon, wired add-to-cart, cart page |
| 2 | Checkout + Orders | ~400 | PR 1 | Checkout form, order creation, stock reservation |
| 3 | MercadoPago + Webhook | ~360 | PR 2 | MP preference, redirect, webhook receiver, status sync |
| 4 | Order Display + Polish | ~200 | PR 3 | Success/failure pages, public order detail |

## Key Decisions

- **Currency**: Per-product (USD/ARS). Mixed-currency carts forbidden.
- **Cart**: Zustand + localStorage.
- **orderNumber**: NanoID 12-char, no prefix.
- **MP integration**: SDK + `metadata` pattern (goncy reference).
- **Stock race condition**: `$transaction` with `WHERE stock >= quantity`.
- **Webhook dev**: curl simulation for unit tests, ngrok for E2E.
- **Preference timeout**: 30 min; checkout-time cleanup via `$queryRaw`.

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Stock race condition | `$transaction` + WHERE clause |
| Duplicate webhook | `eventId @unique` + re-query MP API |
| Unvalidated webhook | Validate `x-signature` day 1 |
| MP SDK edge runtime | `runtime = "nodejs"` in route handler |
| Expired preference holds stock | 30-min timeout + checkout cleanup |

## Dependencies

- **Packages**: `mercadopago`, `zustand`, `nanoid`, `react-hook-form`, `@hookform/resolvers`, `zod`
- **Schema**: `Product.currency` added pre-R2
- **Env vars**: `MERCADOPAGO_ACCESS_TOKEN`, `MERCADOPAGO_WEBHOOK_SECRET`, `NEXT_PUBLIC_SITE_URL`
- **Dev tools**: ngrok (webhook E2E), MP test credentials

## Non-Goals

Auth, customer accounts, admin dashboard, shipping costs, coupons, product variants, multi-currency carts, invoice generation.

## Success Criteria

- [ ] Add-to-cart button wired and functional
- [ ] Cart persists across page refreshes
- [ ] Checkout creates Order + Address + Payment in single transaction
- [ ] Stock atomically reserved and released on cancellation
- [ ] MercadoPago redirect works with test credentials
- [ ] Webhook processes payments idempotently with signature validation
- [ ] Order detail page accessible by order number
- [ ] All 5 PRs pass build + lint
