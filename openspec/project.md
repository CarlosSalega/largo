# Ecommerce MVP

## Vision

Create a simple single-tenant ecommerce platform for entrepreneurs that allows selling products online, receiving payments through Mercado Pago, and managing orders from an administrative dashboard.

## Goals

- Fast product publication
- Professional storefront
- Online payments with Mercado Pago
- Order management
- Simple administration

## Non-Goals

The following features are explicitly out of scope for the MVP:

- Multi-tenant architecture
- Marketplace functionality
- Coupons and promotions engine
- Product reviews
- Product variants
- Multiple warehouses
- ERP/CRM integrations
- Loyalty programs
- Advanced shipping automation

## Users

### Visitor

Can:
- Browse homepage
- Browse catalog
- Search products
- Filter products by category and brand
- View product details
- Add products to cart

### Customer

Can:
- Complete checkout as guest
- Pay using Mercado Pago Checkout Pro
- Register and access personal dashboard
- View order history
- Manage profile

### Administrator

Can:
- Manage products (CRUD, images, stock, featured status)
- Manage categories (CRUD, images, featured status)
- Manage orders (view, filter, update status)
- Configure homepage content

## Business Rules

- Single tenant application
- Guest checkout enabled (customer data collected at checkout, account creation optional)
- Simple stock management (integer stock count per product)
- Products do not have variants (each combination is a separate product)
- Mercado Pago Checkout Pro is the only payment method
- Order status is controlled exclusively by webhook notifications
- Order lifecycle: PENDING → PAID (webhook approved) / CANCELLED (webhook rejected) / REFUNDED (manual)
- Guest orders are linked to customer accounts when registering with the same email

## Releases

| Release | Scope |
|---------|-------|
| Release 1 | Homepage, Catalog, Product Detail |
| Release 2 | Cart, Checkout, Orders, Payments (MercadoPago) |
| Release 3 | Authentication, Customer Dashboard |
| Release 4 | Admin Products, Admin Categories, Admin Orders |
