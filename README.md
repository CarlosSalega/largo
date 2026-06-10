# Largo

Single-tenant ecommerce MVP for entrepreneurs. Sell products online, collect payments with Mercado Pago, and manage orders from an admin dashboard.

## Features

- **Public Storefront** — Homepage with hero, featured categories/products/brands, catalog with search, filters, sorting, and pagination
- **Product Detail** — Image gallery, stock availability, related products, SEO-friendly slugs
- **Shopping Cart** — Session-based persistence, quantity management, stock validation
- **Guest Checkout** — No account required, customer/shipping data collected at checkout
- **Payments** — Mercado Pago Checkout Pro with webhook-based order confirmation
- **Order Management** — PENDING → PAID / CANCELLED / REFUNDED lifecycle
- **Customer Dashboard** — Registration, login, order history, profile management
- **Admin Dashboard** — Product, category, and order CRUD with stock and image management

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| UI | Shadcn UI (Radix) |
| Icons | Lucide React |
| Database | PostgreSQL (Neon) |
| ORM | Prisma 7 |
| Auth | Better Auth (planned) |
| Payments | Mercado Pago Checkout Pro (planned) |
| Storage | Cloudinary (planned) |
| Validation | Zod |
| Deployment | Vercel |
| Testing | Vitest (planned) |

## Project Structure

```
largo/
├── prisma/
│   ├── schema.prisma          # 10 models, 3 enums, full indexes
│   ├── seed.ts                # 5 brands, 6 categories, 15 products, admin user
│   └── migrations/
├── src/
│   ├── app/                   # Next.js App Router pages
│   ├── components/
│   │   └── ui/                # Shadcn UI components
│   ├── features/              # Domain modules (catalog, cart, checkout, orders, payments, customers)
│   └── lib/
│       ├── db/                # Prisma client + pg adapter
│       └── utils.ts
├── openspec/                  # SDD specs, architecture, and release plans
│   ├── project.md
│   ├── architecture.md
│   ├── releases/
│   └── specs/                 # 11 domain specs (homepage, catalog, cart, checkout, etc.)
├── public/
├── next.config.ts
├── prisma.config.ts
├── tsconfig.json
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm (recommended) or npm
- PostgreSQL 15+ (local or Neon connection string)

### Install

```bash
pnpm install
```

### Environment Variables

Copy the example and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `BETTER_AUTH_SECRET` | Secret for Better Auth sessions | Release 3 |
| `MERCADOPAGO_ACCESS_TOKEN` | MP API access token | Release 2 |
| `MERCADOPAGO_PUBLIC_KEY` | MP public key | Release 2 |
| `MERCADOPAGO_WEBHOOK_SECRET` | MP webhook verification secret | Release 2 |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Release 1 |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Release 1 |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Release 1 |

### Database Setup

```bash
pnpm db:generate          # Generate Prisma client
pnpm db:migrate           # Run migrations
pnpm db:seed              # Seed database with sample data
```

### Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:migrate` | Run migrations (dev) |
| `pnpm db:migrate:deploy` | Run migrations (production) |
| `pnpm db:seed` | Seed database |
| `pnpm db:studio` | Open Prisma Studio |
| `pnpm db:validate` | Validate Prisma schema |

## Database

The schema includes 10 models across 3 domains:

**Core** — `Brand`, `Category`, `Product`, `ProductImage`
**Commerce** — `Order`, `OrderItem`, `Address`, `User`
**Payments** — `Payment`, `WebhookEvent`

Key design decisions:
- **Soft delete** on Products and Categories (`deletedAt` + `active` flag)
- **Order item snapshots** store product name, price, and image at purchase time
- **Cart is session-based** — not persisted in the database
- **Webhook dedup** via unique `eventId` constraint on `WebhookEvent`

```bash
pnpm db:studio    # Visual database browser
pnpm db:migrate   # Create and apply migrations
pnpm db:seed      # Re-seed: 5 brands, 6 categories, 15 products, 1 admin
```

## Roadmap

| Release | Scope | Status |
|---------|-------|--------|
| **R1 — Public Store** | Homepage, Catalog, Product Detail | In progress |
| **R2 — Commerce** | Cart, Checkout, Orders, MercadoPago | Planned |
| **R3 — Customers** | Auth, Registration, Dashboard, Order History | Planned |
| **R4 — Admin** | Product/Category/Order Management | Planned |

## License

MIT
