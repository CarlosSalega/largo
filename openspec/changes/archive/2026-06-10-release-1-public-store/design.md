# Design: Release 1 — Public Store

## Technical Approach

Use Next.js 16 App Router with Server Components for optimal performance and SEO. Client Components only for interactive elements.

## Architecture Decisions

### Decision: Server Components for Data Fetching
Using Server Components for homepage, catalog, and product detail pages.

**Rationale:**
- Better SEO (server-rendered HTML)
- Faster initial page load
- No client-side data fetching waterfall
- Automatic code splitting

### Decision: Route Group for Public Pages
Using `(public)` route group to separate storefront from admin/auth.

**Rationale:**
- Clean URL structure without `/public` prefix
- Shared layout for all public pages
- Easy to add middleware/auth later

### Decision: API Routes for Catalog Queries
Using Route Handlers for search, filter, and pagination.

**Rationale:**
- Client Components need to fetch data on user interaction
- Separation of concerns (UI vs data layer)
- Easier to test and cache

### Decision: Shadcn UI Components
Using Shadcn UI (radix-nova style) for all UI components.

**Rationale:**
- Already installed and configured
- Accessible by default
- Customizable with Tailwind
- Consistent design system

### Decision: Image Optimization
Using Next.js Image component with Cloudinary URLs.

**Rationale:**
- Automatic image optimization
- Responsive images
- Lazy loading
- Better Core Web Vitals

## File Structure

```
src/
├── app/
│   └── (public)/
│       ├── layout.tsx              # Public layout with header/footer
│       ├── page.tsx                # Homepage
│       ├── catalog/
│       │   └── page.tsx            # Catalog page
│       └── products/
│           └── [slug]/
│               └── page.tsx        # Product detail page
├── features/
│   ├── catalog/
│   │   ├── components/
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductGrid.tsx
│   │   │   ├── CatalogFilters.tsx
│   │   │   ├── CatalogSearch.tsx
│   │   │   └── CatalogPagination.tsx
│   │   └── queries.ts              # Prisma queries for catalog
│   ├── homepage/
│   │   ├── components/
│   │   │   ├── Hero.tsx
│   │   │   ├── Benefits.tsx
│   │   │   ├── FeaturedCategories.tsx
│   │   │   ├── FeaturedProducts.tsx
│   │   │   └── FeaturedBrands.tsx
│   │   └── queries.ts              # Prisma queries for homepage
│   └── product-detail/
│       ├── components/
│       │   ├── ProductGallery.tsx
│       │   ├── ProductInfo.tsx
│       │   ├── ProductStock.tsx
│       │   └── RelatedProducts.tsx
│       └── queries.ts              # Prisma queries for product detail
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Navigation.tsx
│   └── ui/                         # Shadcn UI components (already exist)
└── lib/
    └── api/
        └── catalog/
            └── route.ts            # API route for catalog queries
```

## Component Hierarchy

```
(public)/layout.tsx
├── Header
│   └── Navigation
├── {children}
│   ├── Homepage
│   │   ├── Hero
│   │   ├── Benefits
│   │   ├── FeaturedCategories
│   │   ├── FeaturedProducts
│   │   └── FeaturedBrands
│   ├── Catalog
│   │   ├── CatalogSearch (Client)
│   │   ├── CatalogFilters (Client)
│   │   ├── ProductGrid (Server)
│   │   │   └── ProductCard
│   │   └── CatalogPagination (Client)
│   └── ProductDetail
│       ├── ProductGallery (Client)
│       ├── ProductInfo (Server)
│       ├── ProductStock (Server)
│       └── RelatedProducts (Server)
└── Footer
```

## Data Flow

### Homepage
```
Server Component → Prisma queries → Featured data → Render
```

### Catalog
```
Server Component → Prisma queries → Initial products → Render
Client Component → User interaction → API route → Update UI
```

### Product Detail
```
Server Component → Prisma query by slug → Product data → Render
```

## API Routes

### GET /api/catalog
Query parameters:
- `search` (string) — keyword search
- `category` (string) — category slug
- `brand` (string) — brand slug
- `sort` (string) — price_asc, price_desc, name_asc
- `page` (number) — page number (default 1)
- `limit` (number) — items per page (default 12)

Response:
```json
{
  "products": [...],
  "total": 150,
  "page": 1,
  "limit": 12,
  "totalPages": 13
}
```

## SEO Strategy

### Homepage
- Title: "Largo — [Store Tagline]"
- Description: Store description
- Open Graph: Hero image

### Catalog
- Title: "Products | Largo"
- Dynamic based on filters: "Electronics | Largo"
- Description: Category/brand description

### Product Detail
- Title: "[Product Name] | Largo"
- Description: Product description (first 160 chars)
- Open Graph: Product image
- JSON-LD: Product schema

## Testing Approach

- Visual testing with `pnpm dev`
- Lighthouse audit for performance/SEO
- Manual testing of filters, search, pagination
- Responsive testing (mobile, tablet, desktop)

## File Changes

- `src/app/(public)/layout.tsx` (new)
- `src/app/(public)/page.tsx` (new)
- `src/app/(public)/catalog/page.tsx` (new)
- `src/app/(public)/products/[slug]/page.tsx` (new)
- `src/features/homepage/**` (new)
- `src/features/catalog/**` (new)
- `src/features/product-detail/**` (new)
- `src/components/layout/**` (new)
- `src/lib/api/catalog/route.ts` (new)
- `src/app/globals.css` (modified — add custom styles)
