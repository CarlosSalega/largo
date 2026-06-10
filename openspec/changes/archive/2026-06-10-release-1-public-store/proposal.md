# Proposal: Release 1 — Public Store

## Intent

Implement the public storefront that allows visitors to browse products, search, filter by category/brand, and view product details. This is the foundation for all subsequent releases.

## Scope

**In scope:**
- Homepage with hero, benefits, featured categories/products/brands, footer
- Product catalog with grid layout, search, filters, sorting, pagination
- Product detail page with image gallery, stock display, add-to-cart button
- Responsive header with navigation
- Dynamic SEO metadata for all pages
- Server Components for data fetching
- API routes for catalog queries

**Out of scope:**
- Cart functionality (Release 2)
- Checkout and payments (Release 2)
- Customer authentication (Release 3)
- Admin panel (Release 4)
- Add-to-cart button logic (Release 2)

## Approach

Use Next.js 16 App Router with Server Components for data fetching. Implement:
1. Public route group `(public)` for storefront pages
2. Server Components for homepage, catalog, product detail
3. Client Components for interactive elements (search, filters, gallery)
4. API routes for catalog queries (search, filter, paginate)
5. Shadcn UI components for consistent design
6. Dynamic metadata for SEO

## Affected Specs

- `homepage` — Hero, benefits, featured sections, footer
- `catalog` — Product grid, search, filters, sorting, pagination
- `product-detail` — Product info, images, stock, related products

## Non-Goals

- Cart integration
- User authentication
- Admin functionality
- Payment processing
