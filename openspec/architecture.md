# Architecture

## Overview

Full-stack Next.js application using App Router for both frontend and backend. No separate API server.

## Frontend

- **Framework**: Next.js 16
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Shadcn UI (radix-nova style)
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod validation

## Backend

- **Framework**: Next.js App Router
- **API**: Route Handlers + Server Actions
- **Language**: TypeScript
- **Validation**: Zod

## Database

- **Database**: PostgreSQL
- **ORM**: Prisma 7
- **Hosting**: Neon (serverless Postgres) / Local PostgreSQL for development
- **Client**: `@prisma/client` v7.8 with `@prisma/adapter-pg` driver adapter
- **Config**: `prisma.config.ts` (Prisma 7 moves `datasource.url` out of `schema.prisma`)
- **Schema**: `prisma/schema.prisma`
- **Migrations**: `prisma/migrations/`
- **Seed**: `prisma/seed.ts`

### Prisma 7 Notes

Prisma 7 introduces a breaking change: the `datasource.url` property is no longer supported in `schema.prisma`. Connection URLs are moved to `prisma.config.ts` using `defineConfig()`. The `PrismaClient` constructor requires a driver adapter (`@prisma/adapter-pg` for PostgreSQL TCP connections) or an `accelerateUrl` for Prisma Accelerate.

```
prisma.config.ts  →  defineConfig({ datasource: { url: env("DATABASE_URL") } })
schema.prisma     →  datasource db { provider = "postgresql" }  (no url)
client.ts         →  new PrismaClient({ adapter: new PrismaPg({ connectionString }) })
```

## Authentication

- **Provider**: Better Auth
- **Roles**: ADMIN, CUSTOMER

## Payments

- **Provider**: Mercado Pago
- **Flow**: Checkout Pro (redirect to MP hosted checkout)
- **Confirmation**: Mercado Pago Webhooks (server-to-server)

## Storage

- **Provider**: Cloudinary
- **Usage**: Product images, category images, hero banners, brand logos

## Deployment

- **Frontend**: Vercel
- **Database**: Neon
- **Images**: Cloudinary

## Testing

- **Unit**: Vitest
- **E2E**: Playwright (future, post-MVP)

## SEO

- Product slugs: required
- Category slugs: required
- Dynamic metadata and Open Graph per page

## Domain Structure

```
Content (homepage, hero, benefits, footer)
Catalog (products, categories, brands, search, filters)
Cart (session-based cart, persistence)
Checkout (guest form, order creation, MP preference)
Orders (lifecycle, status management)
Payments (MercadoPago integration, webhook processing)
Customers (auth, profile, order history)
Administration (product/category/order management)
```

## Project Structure

```
src/
├── app/
│   ├── (public)/          # Public storefront routes
│   ├── (auth)/            # Authentication routes
│   ├── admin/             # Admin dashboard routes
│   └── account/           # Customer dashboard routes
├── features/
│   ├── catalog/
│   ├── cart/
│   ├── checkout/
│   ├── orders/
│   ├── payments/
│   └── customers/
├── components/
│   └── ui/                # Shadcn UI components
└── lib/
    ├── auth/              # Better Auth config
    ├── db/
    │   ├── client.ts      # Prisma singleton + pg adapter
    │   └── types.ts       # Re-exported Prisma types
    ├── cloudinary/        # Cloudinary config
    └── mercadopago/       # MercadoPago SDK config

prisma/
├── schema.prisma          # 10 models, 3 enums, all indexes
├── config.ts              # Prisma 7 config (datasource URL)
├── seed.ts                # Seed: 5 brands, 6 categories, 15 products, admin user
└── migrations/            # Initial migration
```

## Domain Model (Implemented — v1)

10 models, 3 enums, implemented in `prisma/schema.prisma`:

| Model | Description | Key Relations |
|-------|-------------|---------------|
| **Brand** | Product manufacturer/brand | Has many Products |
| **Category** | Product category with soft delete | Has many Products |
| **Product** | Sellable item with price/stock | Belongs to Brand, Category; Has many ProductImages |
| **ProductImage** | Cloudinary-hosted product image | Belongs to Product |
| **User** | Auth user with role enum | Has many Orders; can be null for guest orders |
| **Order** | Purchase order with status lifecycle | Belongs to User?; Has one Address, Payment; Has many OrderItems |
| **OrderItem** | Snapshot of product at purchase time | Belongs to Order, Product |
| **Address** | Shipping address (1:1 with Order) | Belongs to Order |
| **Payment** | MercadoPago payment record | Belongs to Order (1:1) |
| **WebhookEvent** | MP notification with dedup | Independent (provider + eventId unique) |

**Enums**: `UserRole` (ADMIN, CUSTOMER), `OrderStatus` (PENDING, PAID, CANCELLED, REFUNDED), `PaymentStatus` (PENDING, APPROVED, REJECTED, REFUNDED)

### Design Decisions
- **Soft delete**: Products and Categories use `deletedAt` + `active` flag
- **Order item snapshots**: `productName`, `productPrice`, `productImage` stored in OrderItem for historical accuracy
- **Cart**: NOT persisted in database — session-based via cookies/localStorage for MVP
- **Webhook dedup**: `WebhookEvent.eventId` unique constraint + `processed` flag
