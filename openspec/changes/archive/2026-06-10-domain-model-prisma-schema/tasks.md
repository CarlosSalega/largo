# Tasks: Domain Model and Prisma Schema v1

## 1. Prisma Setup

- [x] 1.1 Install Prisma dependencies (`prisma`, `@prisma/client`)
- [x] 1.2 Initialize Prisma (`prisma init`)
- [x] 1.3 Configure PostgreSQL connection in `.env`
- [x] 1.4 Add `DATABASE_URL` to `.env.example`

## 2. Schema Definition

- [x] 2.1 Define enums: `OrderStatus`, `PaymentStatus`, `UserRole`
- [x] 2.2 Define `Brand` model with indexes
- [x] 2.3 Define `Category` model with indexes and soft delete
- [x] 2.4 Define `Product` model with relations and indexes
- [x] 2.5 Define `ProductImage` model
- [x] 2.6 Define `User` model with role enum
- [x] 2.7 Define `Order` model with status enum and relations
- [x] 2.8 Define `OrderItem` model with snapshot fields
- [x] 2.9 Define `Address` model (one-to-one with Order)
- [x] 2.10 Define `Payment` model with status enum
- [x] 2.11 Define `WebhookEvent` model with deduplication fields
- [x] 2.12 Add all relationships and foreign keys
- [x] 2.13 Add composite indexes for common queries

## 3. Database Client

- [x] 3.1 Create `src/lib/db/client.ts` with Prisma singleton
- [x] 3.2 Create `src/lib/db/types.ts` re-exporting Prisma types
- [x] 3.3 Test client connection

## 4. Migration

- [x] 4.1 Create initial migration (`prisma migrate dev --name init`)
- [x] 4.2 Generate Prisma client (`prisma generate`)
- [x] 4.3 Verify migration SQL is correct
- [x] 4.4 Apply migration to local database

## 5. Seed Data

- [x] 5.1 Create `prisma/seed.ts` script
- [x] 5.2 Seed sample brands (3-5 brands)
- [x] 5.3 Seed sample categories (5-8 categories)
- [x] 5.4 Seed sample products (10-15 products across categories)
- [x] 5.5 Seed admin user (admin@largo.com)
- [x] 5.6 Configure seed in `package.json`
- [x] 5.7 Test seed script (`prisma db seed`)

## 6. Validation

- [x] 6.1 Run `prisma validate` to check schema syntax
- [x] 6.2 Test common queries with Prisma Studio
- [x] 6.3 Verify indexes with `EXPLAIN` on filtered queries
- [x] 6.4 Confirm all relationships work correctly

## 7. Documentation

- [x] 7.1 Update `openspec/architecture.md` with final schema decisions
- [x] 7.2 Add schema diagram (optional) — skipped: design.md already has the domain model diagram
