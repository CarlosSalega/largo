# Architecture

## Overview

Full-stack Next.js application using App Router for both frontend and backend. No separate API server.

## Frontend

- **Framework**: Next.js 16
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Shadcn UI (radix-nova style)
- **Component tokens**: ALWAYS use semantic tokens (`bg-card`, `text-card-foreground`, `border-border`, `bg-primary`, `text-muted-foreground`, etc.). NEVER use hardcoded Tailwind colors (`slate-*`, `blue-*`, `red-*`, `white`, `green-*`). Semantic tokens are defined in `globals.css` via CSS variables and adapt to theme changes automatically.
- **Badge pattern**: Use `variant="default"` for "active" status badges (`bg-primary text-primary-foreground`). Do NOT override with hardcoded green classes.
- **Image component**: Use `SafeImage` (wraps `next/image` with `fill` + fallback) for all images. Parent must have `relative` + fixed size. Do NOT use raw `<img>` tags.
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

### Prisma 7 + Neon Gotchas

- **`migrate dev` non-interactive**: The `prisma migrate dev` command doesn't work in CI/non-interactive environments. Use `prisma db execute` + manual SQL + `prisma migrate resolve --applied` to create and apply migrations.
- **`DATABASE_URL` resolution**: Prisma 7's `prisma.config.ts` uses `env("DATABASE_URL")` which may fail if `.env` isn't loaded. Export env vars explicitly or use `dotenv-cli`.
- **SSL mode**: Use `?sslmode=verify-full` for Neon connections. `require` mode triggers deprecation warnings in Prisma 7 + pg adapter.
- **NULL constraints**: Prisma 7's pg adapter is strict about NOT NULL columns. If a column exists in the DB table but was removed from the Prisma schema, Prisma Client won't send a value for it and PostgreSQL rejects the INSERT. Drop dead columns rather than keeping them.
- **Better Auth requirements**: The `user` model MUST include `emailVerified Boolean @default(false)` — Better Auth's Prisma adapter sets this field regardless of `requireEmailVerification` setting.
- **Upsert issue**: `prisma.user.upsert()` may fail with `NullConstraintViolation` on Neon. Use `findUnique` + `create` as a workaround in seed scripts.
- **SSL warnings**: `sslmode=require` on Neon triggers `SECURITY WARNING` about future SSL mode changes. Use `sslmode=verify-full` to suppress.

## Authentication

- **Provider**: Better Auth v1.6.16
- **Adapter**: `@better-auth/prisma-adapter` (PostgreSQL)
- **Roles**: ADMIN, CUSTOMER
- **Route protection**: `proxy.ts` (Next.js 16) — session check for `/account/*`, role check for `/admin/*`
- **Server guard**: `requireAdmin()` in `src/lib/auth/utils.ts` for Server Components/Actions

### Better Auth — Cookie Golden Rule

**ALL operations that set or clear cookies (sign-in, sign-up, sign-out) MUST use `authClient` (client-side). NEVER use Server Actions for these operations.**

| Operation | Mechanism | Why |
|-----------|-----------|-----|
| Sign in | `authClient.signIn.email()` | Sets session cookie via API route response |
| Sign up | `authClient.signUp.email()` | Sets session cookie via API route response |
| Sign out | `authClient.signOut()` | Clears session cookie via API route response |
| Profile update | Server Action (`updateProfileAction`) | No cookie change needed |
| Password change | Server Action (`changePasswordAction`) | No cookie change needed |
| Session read (RSC) | `auth.api.getSession({ headers })` | Direct DB read, no cookie needed |

**Why**: Server Actions cannot set or clear HTTP `Set-Cookie` headers. Only the Better Auth API route handler (`toNextJsHandler`) has access to response headers. Using `authClient` makes a fetch to `/api/auth/*`, allowing the handler to manage cookies properly.

**Post-auth redirect**: After sign-in/sign-up/sign-out, use `window.location.href` (full page reload) instead of `router.push()`. Full reload ensures cookies are sent/cleared in the HTTP request. `redirect()` from `next/navigation` is NOT suitable because it throws `NEXT_REDIRECT` which must be outside try/catch blocks.

**Turbopack cache**: After changing auth code, run `rm -rf .next` before restarting the dev server. Turbopack caches stale chunks that reference old imports.

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
