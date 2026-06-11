# Proposal: Release 4 — Administration

## Intent

Give store owners a full admin dashboard to manage products, categories, and orders. Currently there's no backend UI — the store operates but the owner can't add products, toggle featured items, or process refunds without direct DB access. This is the first release requiring ADMIN role enforcement.

## Scope

### In Scope
- **Admin auth**: Role-based route guard in `proxy.ts` (`/admin/*` → ADMIN only)
- **Admin layout**: Full-screen sidebar dashboard (NO public Header/Footer)
- **Product CRUD**: List with search/pagination, create/edit form with image upload, stock, featured toggle, activation/deactivation
- **Category CRUD**: List, create/edit form with single image upload, featured toggle
- **Order management**: Paginated list with status/date filters, detail view, manual PAID→REFUNDED transition
- **Cloudinary upload**: Config, API route (`/api/admin/upload`), client hook + component with progress
- **Drag & drop image reordering**: Client-side reorder with `@dnd-kit`, `useImageReorder` hook, `reorderProductImages` Server Action updating `ProductImage.order` in DB
- **Brand inline creation**: Combobox with "Crear nueva" option in product form, `createBrandInline` action (auto-generated slug)
- **Collapsible admin sidebar**: Toggle button, responsive state, CSS animation for better mobile UX
- **Refund confirmation**: AlertDialog confirmation before processing refund in Order Management

### Out of Scope
- Brand CRUD (can select existing brands only)
- Order cancellation/refund via MercadoPago API (status tracking only — no actual MP API call)
- Bulk operations, import/export
- Admin audit log
- Dark mode toggle (already covered by Tailwind 4 system)
- Fixing hardcoded colors in existing pre-R4 components (tech debt)

## Capabilities

### New Capabilities
- `admin-auth`: ADMIN role enforcement in proxy.ts + `requireAdmin()` guard
- `admin-products`: Product table with CRUD, image upload, toggles
- `admin-categories`: Category table with CRUD, image upload, featured toggle
- `admin-orders`: Order list with filters, detail view, status management
- `admin-layout`: Sidebar navigation, no Header/Footer, admin-only

### Modified Capabilities
- `customers`: Add `requireAdmin()` utility in `src/lib/auth/utils.ts` (reusable guard for Server Components/Actions)

## Approach

- **Route guard**: Extend `proxy.ts` — check `session.user.role === "ADMIN"` on `/admin/*` matcher, redirect non-admins to `/ingresar`
- **Layout**: `admin/layout.tsx` — RSC session check as defense-in-depth, sidebar with Productos/Categorías/Órdenes links, `<SignOutButton />`
- **CRUD patterns**: RHF + Zod schemas → Server Actions returning `{ success | error }` → sonner toasts. Identical to existing `customers/actions.ts` + `ingresar/page.tsx` form conventions
- **Data tables**: Server Components fetch via `features/admin/{domain}/queries.ts`, URL search params for page/search/filter, `<Table>` + `<Skeleton>` + `<Pagination>` from shadcn
- **Image upload**: `ImageUpload` client component → `POST /api/admin/upload` (FormData) → Cloudinary SDK `upload_stream` → store `ProductImage` URL + `ProductImage.publicId` (new field via Prisma migration — single field, requires migration)
- **Schema change**: Add `ProductImage.publicId String?` — needed for delete-from-Cloudinary reference. This is the ONLY schema change
- **Soft delete**: Set `deletedAt` + `active = false` on Product/Category "delete" — no Prisma `delete()` calls
- **Order transition**: `updateOrderStatus` action validates PAID→REFUNDED only, updates both Order.status and Payment.status in `$transaction`

## PR Slices

| # | Name | Files | Lines | Depends | Delivers |
|---|------|-------|-------|---------|----------|
| 1 | **Admin Foundation** | ~12 | ~400 | — | shadcn components (14), proxy.ts guard, admin layout+sidebar, Cloudinary config, `ProductImage.publicId` migration |
| 2 | **Image Upload** | ~7 | ~450 | PR 1 | Cloudinary config, `/api/admin/upload` route, `useImageUpload` hook, `ImageUpload` component with drag-and-drop reorder, `.env.example` update. Adds `@dnd-kit` packages |
| 3 | **Product CRUD** | ~9 | ~750 | PR 2 | Admin schemas, product queries/actions, list page (table+search+pagination), create/edit form pages with brand inline creation, collapsible sidebar |
| 4 | **Category CRUD** | ~6 | ~350 | PR 3 | Category queries/actions, list page, create/edit form pages |
| 5 | **Order Management** | ~6 | ~450 | PR 4 | Order queries/actions (filtered), list page, detail page with status action + AlertDialog confirmation, `RequireAdmin` wrapper |
| **Total** | — | **~40** | **~2200** | — | — |

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/proxy.ts` | Modified | Add `/admin/*` matcher + ADMIN role check |
| `src/lib/auth/utils.ts` | New | `requireAdmin()` helper for Server Components |
| `src/lib/cloudinary/config.ts` | New | Cloudinary SDK singleton |
| `src/app/admin/**` | New | Route group: layout, products, categories, orders |
| `src/features/admin/**` | New | queries.ts, actions.ts, schemas.ts per domain |
| `src/components/ui/` | Modified | +12 shadcn components installed |
| `src/components/admin/` | New | ImageUpload, DataTable (shared table wrapper) |
| `src/app/api/admin/upload/route.ts` | New | POST/DELETE Cloudinary upload with ADMIN auth |
| `prisma/schema.prisma` | Modified | `ProductImage.publicId String?` |
| `.env.example` | Modified | +3 Cloudinary vars |
| `src/components/layout/HeaderAuth.tsx` | Modified | Add admin link when `role === ADMIN` |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Cloudinary env vars missing in prod | Medium | Document in `.env.example`; config throws clear error on missing vars |
| Broken catalog after soft-delete (active=false products still referenced) | Low | Catalog queries already filter `where: { active: true, deletedAt: null }` |
| Concurrent admin edits overwrite each other | Low | Acceptable for single-tenant MVP; document limitation |
| Image orphaned in Cloudinary after deletion | Low | Delete Cloudinary asset in `removeProductImage` action; `publicId` field tracks it |
| `ProductImage.publicId` migration breaks existing data | Low | Make field optional (`String?`), existing rows get `NULL` |

## Rollback Plan

- Remove `/admin` route group directory
- Revert `proxy.ts` changes (remove matcher + role check)
- `pnpm dlx prisma migrate dev --name revert-productimage-publicid` (drop column if no other changes depend on it)
- Remove Cloudinary env vars from `.env`
- Revert HeaderAuth admin link

## Dependencies

- **Packages**: Add `@dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`; cloudinary 2.10.0 already installed; zod 4.1.8, RHF 7.57.0, sonner 2.0.7, slugify 1.6.9, date-fns 4.3.0 all present
- **Shadcn install**: `pnpm dlx shadcn@latest add table input select textarea dialog sheet tabs label checkbox switch badge separator dropdown-menu form skeleton pagination alert-dialog command`
- **Prisma migration**: `ProductImage.publicId` (new optional String field — single migration)
- **Env vars (new)**: `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

## Success Criteria

- [ ] Non-admin users redirected away from `/admin/*` routes
- [ ] Admin can create product with name, price, stock, category, brand, images, featured flag
- [ ] Product images upload to Cloudinary via drag-and-drop, appear in preview grid
- [ ] Admin can toggle product active/featured from list view
- [ ] Admin can create/edit/archive categories with image upload
- [ ] Order list paginates and filters by status + date range
- [ ] Admin can view order detail with items, customer, payment info
- [ ] Admin can manually transition PAID→REFUNDED (updates both Order + Payment)
- [ ] Admin sidebar shows "Hola, {name}", navigation, and sign-out
- [ ] All 5 PRs pass `pnpm build` + lint
- [ ] Zero hardcoded colors in new admin components (semantic tokens only)
