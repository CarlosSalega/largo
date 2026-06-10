# Design: Domain Model and Prisma Schema v1

## Technical Approach

Use Prisma ORM with PostgreSQL to define a normalized schema that supports all MVP features. The schema prioritizes simplicity and query performance over normalization purity.

## Architecture Decisions

### Decision: Single User Model with Roles
Using a single `User` model with a `role` enum (ADMIN, CUSTOMER) instead of separate Admin/Customer tables.

**Rationale:**
- Simpler authentication with Better Auth
- Guest orders use email only, linked to User on registration
- No need for separate auth flows

### Decision: Soft Delete for Products and Categories
Using `deletedAt` timestamp instead of hard deletion.

**Rationale:**
- Preserves order history integrity
- Allows recovery of accidentally deleted items
- Orders reference products that may be archived

### Decision: Order Item Snapshot
Storing product name, price, and image URL directly in `OrderItem` instead of only referencing Product.

**Rationale:**
- Product prices change over time
- Orders must reflect the price at purchase time
- Avoids broken references if product is deleted

### Decision: Session-Based Cart
Cart is not persisted in database for MVP. Using cookies/localStorage for guest carts, with optional database persistence for logged-in customers (future enhancement).

**Rationale:**
- Simpler implementation
- Guest checkout is primary flow
- Reduces database load

### Decision: Webhook Event Deduplication
Storing all webhook events with unique `eventId` to prevent duplicate processing.

**Rationale:**
- Mercado Pago may send duplicate notifications
- Idempotent payment processing is critical
- Audit trail for debugging

## Data Model

### Core Entities

```
Brand
- id: UUID
- name: String (unique)
- slug: String (unique, auto-generated)
- logo: String? (Cloudinary URL)
- active: Boolean (default true)
- createdAt, updatedAt

Category
- id: UUID
- name: String (unique)
- slug: String (unique, auto-generated)
- description: String?
- image: String? (Cloudinary URL)
- featured: Boolean (default false)
- active: Boolean (default true)
- deletedAt: DateTime?
- createdAt, updatedAt
- products: Product[]

Product
- id: UUID
- name: String
- slug: String (unique, auto-generated)
- description: String
- price: Decimal (10,2)
- stock: Int (default 0)
- featured: Boolean (default false)
- active: Boolean (default true)
- deletedAt: DateTime?
- brandId: UUID -> Brand
- categoryId: UUID -> Category
- images: ProductImage[]
- createdAt, updatedAt

ProductImage
- id: UUID
- url: String (Cloudinary URL)
- alt: String?
- order: Int (default 0)
- productId: UUID -> Product
- createdAt
```

### Commerce Entities

```
Order
- id: UUID
- orderNumber: String (unique, auto-generated, e.g., "ORD-2026-0001")
- status: OrderStatus (PENDING, PAID, CANCELLED, REFUNDED)
- customerEmail: String
- customerName: String
- customerPhone: String?
- shippingAddress: Address (embedded or relation)
- subtotal: Decimal (10,2)
- total: Decimal (10,2)
- userId: UUID? -> User (null for guest orders)
- items: OrderItem[]
- payment: Payment?
- createdAt, updatedAt

OrderItem
- id: UUID
- orderId: UUID -> Order
- productId: UUID -> Product
- productName: String (snapshot)
- productPrice: Decimal (10,2) (snapshot)
- productImage: String? (snapshot)
- quantity: Int
- subtotal: Decimal (10,2)

Address
- id: UUID
- street: String
- city: String
- state: String
- zipCode: String
- country: String
- orderId: UUID? -> Order (one-to-one)

OrderStatus: enum
- PENDING
- PAID
- CANCELLED
- REFUNDED
```

### Payment Entities

```
Payment
- id: UUID
- orderId: UUID -> Order (one-to-one)
- provider: String (default "mercadopago")
- providerPaymentId: String? (MP payment ID)
- providerPreferenceId: String? (MP preference ID)
- status: PaymentStatus (PENDING, APPROVED, REJECTED, REFUNDED)
- amount: Decimal (10,2)
- currency: String (default "ARS")
- paidAt: DateTime?
- createdAt, updatedAt

PaymentStatus: enum
- PENDING
- APPROVED
- REJECTED
- REFUNDED

WebhookEvent
- id: UUID
- provider: String (default "mercadopago")
- eventId: String (unique, from MP)
- type: String (payment, refund, etc.)
- payload: Json
- processed: Boolean (default false)
- processedAt: DateTime?
- createdAt
```

### User Entities

```
User
- id: UUID
- email: String (unique)
- name: String
- passwordHash: String
- role: UserRole (ADMIN, CUSTOMER)
- emailVerified: Boolean (default false)
- orders: Order[]
- createdAt, updatedAt

UserRole: enum
- ADMIN
- CUSTOMER
```

## Indexes

```
Product:
- slug (unique)
- categoryId (for category filtering)
- brandId (for brand filtering)
- active (for active-only queries)
- featured (for homepage featured)
- [categoryId, active] (compound for category + active filter)
- [brandId, active] (compound for brand + active filter)

Category:
- slug (unique)
- active
- featured

Brand:
- slug (unique)
- active

Order:
- orderNumber (unique)
- userId (for customer order history)
- status (for admin filtering)
- createdAt (for date range queries)
- [userId, createdAt] (compound for customer order history sorted)

Payment:
- orderId (unique, one-to-one)
- providerPaymentId (for webhook matching)

WebhookEvent:
- eventId (unique, for deduplication)
- [provider, type] (for filtering)

User:
- email (unique)
```

## File Changes

- `prisma/schema.prisma` (new) — Complete Prisma schema
- `prisma/seed.ts` (new) — Seed script for initial data
- `src/lib/db/client.ts` (new) — Prisma client singleton
- `src/lib/db/types.ts` (new) — Re-exported Prisma types
- `.env.example` (modified) — Add DATABASE_URL
- `package.json` (modified) — Add prisma, @prisma/client, tsx (for seed)

## Migration Strategy

1. Create initial migration: `prisma migrate dev --name init`
2. Generate Prisma client: `prisma generate`
3. Seed database: `prisma db seed`

## Testing Approach

- Validate schema with `prisma validate`
- Test migrations in local PostgreSQL
- Verify indexes with `EXPLAIN` on common queries
- Seed script creates test data for all entities
