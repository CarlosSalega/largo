# Proposal: Domain Model and Prisma Schema v1

## Intent

Define the domain model and create the initial Prisma schema that will support all four releases of the ecommerce MVP. The schema must accommodate products, categories, brands, cart, orders, payments, customers, and admin functionality as specified in the existing domain specs.

## Scope

**In scope:**
- Domain model design based on all 11 specs
- Prisma schema with all entities and relationships
- Database migrations
- Seed data structure for initial products/categories/brands
- Type generation from Prisma schema

**Out of scope:**
- API implementation (Route Handlers, Server Actions)
- UI components
- Authentication integration (Better Auth setup)
- Mercado Pago SDK integration
- Cloudinary upload logic
- Business logic implementation

## Approach

Derive the domain model from the existing specs, focusing on:
1. Core entities: Brand, Category, Product, ProductImage
2. Commerce entities: Cart, CartItem, Order, OrderItem
3. Payment entities: Payment, WebhookEvent
4. User entities: User (with roles), Address
5. Relationships and constraints
6. Indexes for query performance

The schema will use PostgreSQL with Prisma ORM, hosted on Neon.

## Affected Specs

This change implements the data layer for all specs:
- homepage (featured products/categories/brands)
- catalog (product queries, filters, search)
- product-detail (product data, images, stock)
- cart (cart persistence)
- checkout (order creation, customer data)
- orders (order lifecycle, status)
- payments (payment records, webhook events)
- customers (user accounts, order history)
- admin-products (product CRUD, images)
- admin-categories (category CRUD, images)
- admin-orders (order management)

## Non-Goals

- Multi-tenant support (single tenant only)
- Product variants (each combination is a separate product)
- Advanced inventory management (simple stock count only)
- Multiple payment providers (Mercado Pago only)
- Complex shipping calculations
