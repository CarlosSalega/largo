# Release 4 — Administration

## Scope

- Admin Products
- Admin Categories
- Admin Orders

## Features

- Admin authentication (ADMIN role)
- Product CRUD with image upload to Cloudinary
- Product stock management
- Product featured toggle
- Product activation/deactivation
- Category CRUD with image upload
- Category featured toggle
- Order list with filtering (status, date range)
- Order detail view with customer and payment info
- Order status management (manual refund)

## Dependencies

- Prisma schema (User model with ADMIN role)
- Admin route protection middleware
- Cloudinary upload integration
- Admin layout and navigation

## Success Criteria

Administrators can fully manage store operations: create and edit products with images, manage categories, and view/process orders.
