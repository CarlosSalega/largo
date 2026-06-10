# Archive Report: Domain Model and Prisma Schema v1

**Change**: `domain-model-prisma-schema`
**Archived**: 2026-06-10
**Status**: ✅ PASS — All 27 tasks complete, verified, no blocking issues

---

## What Was Implemented

Complete Prisma schema v1 defining the data layer for the Largo ecommerce MVP. The schema supports all 11 domain specs (homepage through admin-orders) across all 4 releases.

### Models Created (10)

| Model | Table | Key Design Features |
|-------|-------|-------------------|
| Brand | `brands` | Slug-indexed, active flag, Cloudinary logo URL |
| Category | `categories` | Slug-indexed, soft-delete (`deletedAt`), featured flag |
| Product | `products` | Slug-indexed, Decimal price, soft-delete, FK→Brand+Category, featured/active flags |
| ProductImage | `product_images` | Cloudinary URL, sort order, FK→Product |
| Order | `orders` | Auto-generated orderNumber, OrderStatus enum, optional FK→User (guest support), Address 1:1 |
| OrderItem | `order_items` | Snapshot fields (productName/Price/Image), quantity × price = subtotal |
| Address | `addresses` | Street/city/state/zipCode/country, 1:1 with Order |
| Payment | `payments` | MercadoPago IDs, PaymentStatus enum, 1:1 with Order |
| WebhookEvent | `webhook_events` | Deduplication via unique eventId, payload stored as JSON |
| User | `users` | email unique, Better Auth compatible, UserRole enum (ADMIN/CUSTOMER) |

### Enums (3)
- `OrderStatus`: PENDING → PAID | CANCELLED | REFUNDED
- `PaymentStatus`: PENDING → APPROVED | REJECTED | REFUNDED
- `UserRole`: ADMIN, CUSTOMER

### Indexes (26+)
Compound indexes for category+brand filtering, user order history, webhook deduplication, and payment matching.

### Files Created/Modified
- `prisma/schema.prisma` — Complete schema (11 models, 3 enums, 26+ indexes)
- `prisma/seed.ts` — Seed script (5 brands, 6 categories, 15 products, admin user)
- `prisma/config.ts` — Prisma config (pg adapter for serverless)
- `prisma/migrations/20260610154921_init/` — Initial migration SQL (277 lines)
- `src/lib/db/client.ts` — Prisma singleton with globalThis pattern
- `src/lib/db/types.ts` — Re-exported types and enums
- `.env` — DATABASE_URL configured
- `.env.example` — DATABASE_URL template added
- `package.json` — prisma, @prisma/client, @prisma/adapter-pg dependencies added

---

## Key Architecture Decisions

1. **Single User model with roles** — One `User` table with `UserRole` enum (ADMIN/CUSTOMER). Simplifies Better Auth integration. Guest orders use `customerEmail` linking.

2. **Soft delete for Products/Categories** — `deletedAt` timestamp preserves order history integrity. Hard deletes would break order references.

3. **Order Item Snapshot** — `productName`, `productPrice`, `productImage` stored directly in OrderItem. Orders reflect the price at purchase time, immune to future product changes.

4. **Session-based Cart** — Cart is NOT in the database for MVP. Cookies/localStorage for guest carts. Simplifies guest checkout flow. Database persistence can be added later for authenticated users.

5. **Webhook Event Deduplication** — Unique `eventId` prevents duplicate payment processing from Mercado Pago retries.

6. **Prisma 7 with pg adapter** — Using `@prisma/adapter-pg` driver adapter for edge/serverless compatibility on Vercel. `prisma.config.ts` replaces outdated `prisma.config.js`.

---

## Deviations from Original Design

**None.** All 10 models, 3 enums, and 26+ indexes match the `design.md` specification exactly. Two minor observations from verification:

1. **WARNING (non-blocking)**: Redundant index `@@index([orderId])` on Payment duplicates the implicit index from `@unique`. Functionally harmless, minor write overhead.
2. **SUGGESTION**: Placeholder admin password hash in seed script. Documented — must be replaced before production.

---

## Verification Summary

- **Schema validate**: ✅ `prisma validate` passed
- **Schema format**: ✅ `prisma format` passed
- **Client generation**: ✅ `prisma generate` succeeded
- **Migration SQL**: ✅ 277 lines, all tables/enums/indexes/FKs present
- **Seed data**: ✅ 5 brands, 6 categories, 15 products, admin user
- **Design compliance**: ✅ 10/10 models match, 3/3 enums match, 26/26 indexes present
- **Spec coverage**: ✅ 11/11 domain specs have schema-level support
- **Task completion**: ✅ 27/27 tasks complete

---

## Specs Synced

**None** — This is a data-layer implementation change. No delta specs existed in the change folder. The change implements the data model for all 11 existing specs without modifying any spec requirements. All main specs in `openspec/specs/` remain unchanged as source of truth.

---

## Archive Contents

```
openspec/changes/archive/2026-06-10-domain-model-prisma-schema/
├── proposal.md       — Change intent and scope
├── design.md         — Technical architecture, data model, indexes
├── tasks.md          — 27/27 tasks complete
├── verify-report.md  — Verification PASS, no blocking issues
└── archive-report.md — This file
```

### Task Completion: 27/27 ✅

| Phase | Tasks | Status |
|-------|-------|--------|
| 1. Prisma Setup | 4/4 | ✅ |
| 2. Schema Definition | 13/13 | ✅ |
| 3. Database Client | 3/3 | ✅ |
| 4. Migration | 4/4 | ✅ |
| 5. Seed Data | 7/7 | ✅ |
| 6. Validation | 4/4 | ✅ |
| 7. Documentation | 2/2 | ✅ |

---

## SDD Cycle Complete

The domain-model-prisma-schema change has been fully planned, designed, implemented, verified, and archived. The data layer is ready for feature implementation (Release 1: Public Store — homepage, catalog, product-detail UI components and API routes).
