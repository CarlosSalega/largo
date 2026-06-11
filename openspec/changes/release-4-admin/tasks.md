# Tasks: Release 4 — Administration

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~2200 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Delivery strategy | ask-on-risk |
| Suggested split | PR 1 → PR 2 → PR 3 → PR 4 → PR 5 |
| Chain strategy | feature-branch-chain |

Decision needed before apply: No (resolved: feature-branch-chain, size:exception accepted for shadcn generated code)
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Auth guard, admin layout, shadcn, Cloudinary, migration | PR 1 | Base; all later PRs depend |
| 2 | Image upload API + drag-drop hooks + ImageUpload component | PR 2 | Depends on PR 1 |
| 3 | Product CRUD, BrandCombobox, SidebarToggle, DataTable | PR 3 | Depends on PR 2 |
| 4 | Category CRUD — reuses ImageUpload (maxImages=1) | PR 4 | Depends on PR 3 |
| 5 | Order list/detail, status filters, refund with AlertDialog | PR 5 | Depends on PR 4 |

## Phase 1: Admin Foundation (PR 1)

- [x] 1.1 Install 18 shadcn components: `table input select textarea dialog sheet tabs label checkbox switch badge separator dropdown-menu skeleton pagination command alert-dialog input-group`
- [x] 1.2 Add `publicId String?` to `ProductImage` model, run `pnpm dlx prisma migrate dev --name add-productimage-publicid`
- [x] 1.3 Create `src/lib/cloudinary/config.ts`: v2 singleton with env-var validation
- [x] 1.4 Create `src/lib/auth/utils.ts`: `requireAdmin()` redirects non-ADMIN, returns `{ id, name }`
- [x] 1.5 Modify `src/proxy.ts`: add `/admin/:path*` matcher, check `role === "ADMIN"`, redirect non-admins
- [x] 1.6 Create `src/app/admin/layout.tsx`: RSC session check, sidebar nav, sign-out, no Header/Footer
- [x] 1.7 Create `src/app/admin/page.tsx` (redirect → `/admin/products`) + `src/components/admin/RequireAdmin.tsx`
- [x] 1.8 Modify `HeaderAuth.tsx`: add "Admin" link when ADMIN; update `Header.tsx` to pass role; update `.env.example` with 3 Cloudinary vars
- [x] 1.9 Verify `pnpm build` + `pnpm lint` — both pass with zero errors

## Phase 2: Image Upload + Drag & Drop (PR 2)

- [ ] 2.1 Install `@dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities` + shadcn `input textarea select label switch form`
- [ ] 2.2 Create `src/app/api/admin/upload/route.ts`: POST (FormData→Cloudinary) + DELETE handlers, ADMIN auth
- [ ] 2.3 Create `src/hooks/use-image-upload.ts` (upload, progress, remove) + `src/hooks/use-image-reorder.ts` (drag-and-drop via @dnd-kit)
- [ ] 2.4 Create `src/components/admin/ImageUpload.tsx`: drag/click zone, sortable preview grid, progress bar, remove, empty/disabled/max states
- [ ] 2.5 Verify `pnpm build` + `pnpm lint`

## Phase 3: Product CRUD + Brand + Sidebar (PR 3)

- [ ] 3.1 Install shadcn `dialog command` + create `src/features/admin/products/schemas.ts` (Zod: all product fields)
- [ ] 3.2 Create `src/features/admin/products/queries.ts`: paginated list with filter tabs (Todos/Activos/Sin stock/Con stock) + getById
- [ ] 3.3 Create `src/features/admin/products/actions.ts`: create, update, toggleActive, toggleFeatured, archive, reorderImages, createBrandInline — all `requireAdmin()`
- [ ] 3.4 Create `BrandCombobox.tsx` (Command + inline create) + `SidebarToggle.tsx` (collapsible CSS transition) + `DataTable.tsx` (generic table wrapper)
- [ ] 3.5 Create `src/app/admin/products/page.tsx`: server table, search, pagination, filter tabs, toggle switches per row
- [ ] 3.6 Create `src/app/admin/products/new/page.tsx` + `[id]/edit/page.tsx`: RHF+Zod forms with ImageUpload + BrandCombobox
- [ ] 3.7 Verify `pnpm build` + `pnpm lint`

## Phase 4: Category CRUD (PR 4)

- [ ] 4.1 Create `src/features/admin/categories/{schemas,queries,actions}.ts` — all guarded by `requireAdmin()`
- [ ] 4.2 Create `src/app/admin/categories/page.tsx`: table with search, pagination, featured toggle per row
- [ ] 4.3 Create `src/app/admin/categories/new/page.tsx` + `[id]/edit/page.tsx`: RHF+Zod + ImageUpload (maxImages=1); edit replaces old image
- [ ] 4.4 Verify `pnpm build` + `pnpm lint`

## Phase 5: Order Management (PR 5)

- [ ] 5.1 Install shadcn `alert-dialog` + create `src/features/admin/orders/{schemas,queries}.ts` (status, date, search filters)
- [ ] 5.2 Create `src/features/admin/orders/actions.ts`: `updateOrderToRefunded` — PAID→REFUNDED only via `$transaction` Order+Payment
- [ ] 5.3 Create `src/app/admin/orders/page.tsx`: status dropdown, date range, search, server table, pagination
- [ ] 5.4 Create `src/app/admin/orders/[orderNumber]/page.tsx`: full detail, AlertDialog refund confirmation, `OrderStatusBadge` reuse
- [ ] 5.5 Verify `pnpm build` + `pnpm lint`
