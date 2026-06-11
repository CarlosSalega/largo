## Exploration: Release 4 — Administración

### Current State

#### Prisma Schema — Admin-ready
The schema already supports all admin operations. No schema changes needed:
- **Product**: `stock` (Int), `featured` (Boolean), `active` (Boolean), `deletedAt` (DateTime?), `images` (ProductImage[]), belongs to Brand + Category
- **Category**: `featured` (Boolean), `active` (Boolean), `image` (String?), `deletedAt` (DateTime?)
- **Order**: `status` (OrderStatus: PENDING → PAID → CANCELLED/REFUNDED), `userId` (nullable, for guest orders), `payment` (Payment 1:1), `customerEmail`, `customerName`, `subtotal`, `total`
- **User**: `role` (UserRole: ADMIN | CUSTOMER), default CUSTOMER
- **ProductImage**: separate model with `url`, `alt`, `order` — Cloudinary URLs stored as strings

#### Auth — Role exists but not enforced
- Better Auth with Prisma adapter, email/password only
- Session via `auth.api.getSession({ headers })` returns `{ user: { id, email, name, role, image } }`
- `proxy.ts` protects `/account/*` but only checks session existence — does **not** check role
- Admin seed user created in `prisma/seed/users.ts`: `admin@largo.com`, role ADMIN, no password (register via `/ingresar` first)
- No admin middleware/guard exists yet

#### Existing Patterns (reusable for admin)
- **Forms**: RHF + `zodResolver` from `@hookform/resolvers` + Zod schemas + sonner toasts + `min-h-[1.5rem]` error space + disabled/pending submit buttons — established in `ingresar/page.tsx` and `account/profile/page.tsx`
- **Server Actions**: `"use server"` functions returning `{ success: true }` or `{ error: string }` — established in `customers/actions.ts`, `checkout/actions.ts`
- **Queries**: server-side async functions in `features/{domain}/queries.ts` using Prisma directly — catalog, customers, orders, product-detail
- **Transactions**: Prisma `$transaction` pattern established in `checkout/actions.ts` and MP webhook
- **Layout Sidebar**: `account/layout.tsx` — `w-64 shrink-0 border-r border-border bg-card p-6` sidebar + `min-w-0 flex-1 p-6` main content
- **Heder/Footer**: `Header` + `Footer` server components in `components/layout/`
- **Lists**: `account/orders/page.tsx` — list with `divide-y divide-border rounded-lg border border-border bg-card`
- **Order detail**: `features/orders/components/OrderDetail.tsx` — reusable, just needs admin context (status change button)
- **Slug generation**: `slugify` in `prisma/seed/utils.ts` — will need similar in admin actions
- **Pagination**: `features/catalog/queries.ts` — `skip`/`take` with `totalPages` calculation
- **Zustand store**: `features/cart/store.ts` — `persist` middleware pattern for client state

#### Shadcn UI Components — Minimal
Only 3 components installed in `src/components/ui/`:
- `button.tsx` — with variants (default, destructive, outline, secondary, ghost, link) and sizes
- `card.tsx` — Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
- `safe-image.tsx` — `<img>` with error/loading state, not from shadcn

#### Dependencies — All present
No new npm packages needed for admin. All already in `package.json`:
- `cloudinary: 2.10.0` — installed but not configured (no `lib/cloudinary/`, no env vars)
- `react-hook-form: 7.57.0` + `@hookform/resolvers: 5.0.1` + `zod: 4.1.8` — form stack
- `sonner: 2.0.7` — toasts
- `date-fns: 4.3.0` — date formatting
- `slugify: 1.6.9` — URL slug generation
- `shadcn: 4.11.0` — CLI for adding components

#### Route Structure
| Route | Directory | Access |
|-------|-----------|--------|
| `/` | `(public)/page.tsx` | Public |
| `/catalog` | `(public)/catalog/page.tsx` | Public |
| `/products/[slug]` | `(public)/products/[slug]/page.tsx` | Public |
| `/cart` | `(public)/cart/` | Public |
| `/checkout` | `(public)/checkout/` | Public |
| `/orders/[orderNumber]` | `(public)/orders/[orderNumber]/page.tsx` | Public |
| `/ingresar` | `(auth)/ingresar/page.tsx` | Guest-only |
| `/account` | `account/layout.tsx` | Auth (any role) |
| `/account/orders` | `account/orders/page.tsx` | Auth |
| `/account/orders/[orderNumber]` | `account/orders/[orderNumber]/page.tsx` | Auth |
| `/account/profile` | `account/profile/page.tsx` | Auth |
| `/api/auth/[...all]` | `api/auth/[...all]/route.ts` | Better Auth |
| `/api/catalog` | `api/catalog/route.ts` | Public |
| `/api/webhooks/mercadopago` | `api/webhooks/mercadopago/route.ts` | MP webhook |

Admin routes would map to:
- `/admin` — dashboard (redirect to products or overview)
- `/admin/products` — product list
- `/admin/products/new` — product creation
- `/admin/products/[productId]/edit` — product editing
- `/admin/categories` — category list
- `/admin/categories/new` — category creation
- `/admin/categories/[categoryId]/edit` — category editing
- `/admin/orders` — order list
- `/admin/orders/[orderNumber]` — order detail with admin actions
- `/api/admin/upload` — Cloudinary image upload

### Gaps

1. **Admin Route Guard**: `proxy.ts` only checks session existence, not role. Need `session.user.role === "ADMIN"` check for `/admin/*` routes.

2. **Admin Layout**: No `admin/layout.tsx`. Needs sidebar with navigation: Productos, Categorías, Órdenes. Should follow `account/layout.tsx` pattern (w-64 sidebar + flex-1 main).

3. **Shadcn Components**: Only 3 of ~15 needed are installed. Missing: `table`, `input`, `select`, `textarea`, `dialog`, `sheet`, `tabs`, `label`, `checkbox`, `switch`, `badge`, `separator`, `dropdown-menu`, `form` (RHF wrapper), `skeleton`, `pagination`.

4. **Data Tables**: No sortable/filterable table pattern exists. Need paginated product/category/order tables with column headers, search, status filters.

5. **CRUD Forms**: No product/category creation or editing forms. Need to build with existing RHF + Zod pattern.

6. **Image Upload**: Cloudinary npm package installed but:
   - No `src/lib/cloudinary/config.ts` (Cloudinary SDK initialization)
   - No env variables (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET)
   - No upload API route
   - No upload UI component (drag-and-drop, preview, progress)

7. **Order Status Management**: No Server Action for manually changing order status (e.g., CANCELLED → REFUNDED for manual refund). Existing webhook handles automatic PENDING→PAID|CANCELLED on payment events.

8. **Admin Navigation in Header**: No link to `/admin` in Header/Navigation for admin users. `HeaderAuth.tsx` doesn't check role.

9. **Error/Not Found pages**: No dedicated admin 404 or unauthorized page.

10. **Brand Management**: Not in scope for Release 4 but worth noting — brands can't be created/edited/deleted through admin yet.

### Dependencies

**None to add** — all required packages are already in `package.json`.

Shadcn components to install (via `pnpm dlx shadcn@latest add`):
```
table input select textarea dialog sheet tabs label checkbox
switch badge separator dropdown-menu form skeleton pagination
```

### Recommended Approach

#### 1. Route Protection — Extend `proxy.ts`

```typescript
// Add to proxy.ts matcher and logic
if (pathname.startsWith("/admin")) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/ingresar", request.url));
  }
}
```

Also add a `requireAdmin()` helper in `src/lib/auth/utils.ts` for use in Server Components and Server Actions (defensive double-check).

#### 2. Feature Structure — `src/features/admin/`

```
src/features/admin/
├── schemas.ts          # Product & Category Zod schemas (create + update)
├── products/
│   ├── queries.ts      # getAdminProducts (paginated, filterable)
│   └── actions.ts      # createProduct, updateProduct, deleteProduct, toggleActive/Featured
├── categories/
│   ├── queries.ts      # getAdminCategories
│   └── actions.ts      # createCategory, updateCategory, deleteCategory, toggleActive/Featured
└── orders/
    ├── queries.ts      # getAdminOrders (paginated, filterable by status, date)
    └── actions.ts      # updateOrderStatus (for manual refund)
```

#### 3. Route Structure — `src/app/admin/`

```
src/app/admin/
├── layout.tsx          # Admin sidebar layout (NO Header/Footer — full dashboard)
├── page.tsx            # Redirect to /admin/products or quick dashboard
├── products/
│   ├── page.tsx        # Server component: data table with search, pagination
│   ├── new/
│   │   └── page.tsx    # Client component: product creation form with image upload
│   └── [productId]/
│       └── edit/
│           └── page.tsx # Client component: product editing form
├── categories/
│   ├── page.tsx        # Server component: data table
│   ├── new/
│   │   └── page.tsx    # Client component: category creation form
│   └── [categoryId]/
│       └── edit/
│           └── page.tsx # Client component: category editing form
└── orders/
    ├── page.tsx        # Server component: data table with status filter
    └── [orderNumber]/
        └── page.tsx   # Server component: order detail with admin actions
```

#### 4. Cloudinary — `src/lib/cloudinary/`

```
src/lib/cloudinary/
└── config.ts  # Cloudinary SDK init with env vars (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET)
```

Image upload flow:
1. `ImageUpload` client component (drag-and-drop, preview, file validation)
2. Upload via Server Action that uses Cloudinary SDK's `uploader.upload_stream` or `uploader.upload`
3. Return URL + public_id on success
4. Store URL in `ProductImage` table with order
5. Cleanup: delete from Cloudinary when image is removed from product

#### 5. Admin Layout Pattern

Follow `account/layout.tsx` but WITHOUT Header/Footer (full-screen admin dashboard):

```tsx
// admin/layout.tsx
export default async function AdminLayout({ children }) {
  // Session + role check (defensive double-check)
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "ADMIN") { /* unauthorized */ }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar session={session} />
      <main className="min-w-0 flex-1 p-6">{children}</main>
    </div>
  );
}
```

Sidebar sections:
- **Inventario**: Productos, Categorías
- **Ventas**: Órdenes
- Admin greeting (Hola, {name}) + Cerrar sesión

#### 6. Form Patterns

Reuse the established pattern from `ingresar/page.tsx` and `account/profile/page.tsx`:
- `"use client"` page
- `useForm<SchemaType>({ resolver: zodResolver(schema) })`
- Each field: label + input + `min-h-[1.5rem]` error space
- Submit button: disabled when pending, loading text
- `toast.success()` / `toast.error()` from sonner
- Redirect after successful creation

For image upload within forms:
- Separate `ImageUpload` component with internal state (files, previews, upload progress)
- Parent form manages final `imageUrls` array

### Complexity Assessment

| Metric | Value |
|--------|-------|
| **Scale** | 3/5 — Moderate |
| **Schema changes** | None |
| **New files** | ~20-25 files |
| **Est. LOC** | ~2000-2500 lines |
| **Shadcn components to install** | ~12-14 |

Breakdown:
- Admin layout + sidebar: ~150 lines
- proxy.ts extension: ~30 lines
- Cloudinary config + upload API: ~80 lines
- ImageUpload component: ~150 lines
- Product CRUD (page + form + queries + actions + schemas): ~600 lines
- Category CRUD: ~400 lines
- Order management: ~400 lines
- Admin queries (paginated, filtered): ~300 lines
- Shared data table components: ~200 lines
- Admin schemas: ~100 lines

### Risks

1. **Hardcoded colors in existing components**: `OrderDetail.tsx`, `CustomerStep.tsx`, `CheckoutForm.tsx`, `OrderStatusBadge.tsx` use hardcoded `text-slate-*`, `text-white`, `bg-blue-600` instead of semantic tokens. New admin components must use semantic tokens exclusively (`text-card-foreground`, `bg-card`, `border-border`, `bg-primary`, `text-muted-foreground`). The existing hardcoded components are out of scope but should be noted as technical debt.

2. **Cloudinary configuration**: Requires 3 environment variables (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) — these are NOT in `.env.example` yet. The `.env` setup step must be documented.

3. **Image upload size/type validation**: Must validate file size and type both client-side (before upload) and server-side (in the Server Action). Cloudinary free tier has limits.

4. **N+1 queries in admin lists**: Product list needs `include: { images: { take: 1 }, category: { select: { name: true } }, brand: { select: { name: true } } }` — already a pattern in catalog queries, just needs to be extended for admin (no `active` filter, `deletedAt` handling).

5. **Soft delete vs hard delete**: Products and Categories use `deletedAt` for soft delete. Admin should support both soft-delete (toggle active) and possibly permanent delete. Need to decide scope. Release spec says "activation/deactivation" → toggle `active` + set `deletedAt`.

6. **Order status transitions**: Manual refund flow: PAID → REFUNDED. Must also update Payment status to REFUNDED. This is a business logic risk — no actual refund via MercadoPago API in MVP, just status tracking.

7. **Admin seed user has no password**: `prisma/seed/users.ts` creates user with no password. Admin must register via `/ingresar` to set one. This flow must be documented or the seed should be updated.

8. **Concurrent admin access**: No optimistic locking — two admins editing the same product could overwrite each other. Acceptable for single-tenant MVP but should be documented.

### Open Questions

1. **Should admin have their own separate layout without Header/Footer?** The architecture.md says `admin/` is a route group separate from `(public)/`. The account layout includes Header+Footer. For admin, a full-screen dashboard without store Header/Footer seems more appropriate — confirms better UX.

2. **Should brand management be included?** Release scope explicitly says Products, Categories, Orders only — NOT Brands. Brands can't be created/edited through admin. Products can be assigned to existing brands only.

3. **Image deletion from Cloudinary**: When a product image is removed in admin, should we delete the Cloudinary asset or just the DB record? Deleting is cleaner but irreversible.

4. **Order detail page — reuse `OrderDetail.tsx` or create admin-specific variant?** The existing component has hardcoded colors and no admin actions. Better to create `AdminOrderDetail` that wraps the core info but adds status management buttons.

5. **Pagination parameters for admin lists**: What page size? 20 products, 20 categories, 20 orders seems reasonable.

6. **Catalog search debounce on admin tables**: Use URL search params (like catalog) or client-side filtering? For MVP, URL search params (server-side) is consistent with existing catalog pattern.

### Ready for Proposal

**Yes** — All core understanding is established:
- No schema changes required
- Patterns are established and reusable
- Dependencies are all present
- Route structure is clear
- Gaps are well-defined
- Risks are manageable

The proposal should focus on: Cloudinary setup, shadcn component installation, proxy.ts extension, and the 3 CRUD screens (Products, Categories, Orders) with their respective forms, queries, and Server Actions.
