# Design: Release 4 — Administration

## Technical Approach

Serve-side rendered admin dashboard behind role-gated proxy. RSC pages fetch data via `features/admin/{domain}/queries.ts`, mutations use Server Actions with `{ success | error }` return pattern, forms use RHF + Zod + sonner — identical to existing `customers/actions.ts` and `ingresar/page.tsx`. Image upload is the only API route (FormData limitation). Defense-in-depth: `proxy.ts` gate + `admin/layout.tsx` RSC session check + `requireAdmin()` in actions. Zero hardcoded colors.

## Architecture Decisions

| # | Decision | Choice | Rejected | Rationale |
|---|----------|--------|----------|-----------|
| 1 | **Form errors** | Inline Zod + sonner for server | Separate error state/context | Matches existing `ingresar/page.tsx` pattern; no new API surface |
| 2 | **Data table** | Server-side pagination via URL `searchParams` | Client-side `useState` | Admin tables can be large; URL params survive refresh and are shareable |
| 3 | **Image upload** | API route `POST /api/admin/upload` | Server Action | Server Actions don't handle `FormData` file uploads reliably; API routes do |
| 4 | **Admin layout** | RSC session check in `layout.tsx` + `proxy.ts` | proxy-only | Defense-in-depth; same pattern as `account/layout.tsx` |
| 5 | **Product form** | Dedicated page (`/new`, `/[id]/edit`) | Dialog/Sheet | Multi-image upload + rich form needs full-page real estate |
| 6 | **Category image** | Reuse `ImageUpload` with `maxImages={1}` | Separate component | Zero code duplication; `ImageUpload` already supports `maxImages` prop |
| 7 | **Order filters** | URL `searchParams` | Client `useState` | Consistent with table decision; persists across navigation |
| 8 | **Slug generation** | Server-side in action | Client-side `slugify` | Must check uniqueness against DB; server is the source of truth |
| 9 | **Search** | Form submit + reset button | Debounced URL push | Admin volume is low; simpler UX, fewer state bugs |
| 10 | **Route structure** | Flat: `/admin/products`, `/admin/products/new`, `/admin/products/[id]/edit` | Nested layout | Fewer files; all share only `admin/layout.tsx` sidebar |
| 11 | **Sidebar** | Collapsible | Fixed width | Better mobile UX; user requested toggle button with CSS animation |
| 12 | **Image ordering** | Drag & drop | Upload order only | User prioritized UX; `@dnd-kit` is lightweight (~15 kB gzipped) |
| 13 | **Brand in product form** | Combobox + inline create | Dropdown (existing only) | Better UX; avoids context switch to separate Brand CRUD |
| 14 | **Refund trigger** | AlertDialog confirmation | Direct button | Prevents accidental refunds |
| 15 | **Product list default** | All products (filterable) | Active only | User requested visibility into full catalog; filter by Todos/Activos/Sin stock/Con stock |
| 16 | **Image URL storage** | `ProductImage.url` = transformed URL; `ProductImage.publicId` = Cloudinary `public_id` | Store only `publicId` and resolve at query time | Matches `ejemplo-images-feature` pattern; `resolveImageUrl` utility generates full URL from `publicId` |

## Data Flow

```
Browser                          Server                          Cloudinary/DB
  │                                │                                │
  ├─ GET /admin/products ─────────►│                                │
  │                                ├─ proxy.ts: /admin/* → ADMIN?   │
  │                                ├─ layout.tsx: session check     │
  │                                ├─ getAdminProducts(searchParams)│
  │                                │   └─► DB                       │
  │◄── RSC HTML (table data) ─────┤                                │
  │                                │                                │
  ├─ POST product form ───────────►│                                │
  │  (RHF + Zod client-side)       ├─ requireAdmin()               │
  │                                ├─ createProduct(data)           │
  │                                │   ├─ generate slug (server)    │
  │                                │   └─► DB                       │
  │◄── { success \| error } ──────┤                                │
  │  sonner toast                  │                                │
  │                                │                                │
  ├─ Image upload (FormData) ─────►│                                │
  │  via useImageUpload hook       ├─ POST /api/admin/upload        │
  │                                │   ├─ auth.api.getSession()     │
  │                                │   ├─ role === ADMIN?           │
  │                                │   └─► Cloudinary upload_stream │
  │◄── { key, url } ──────────────┤◄─── Cloudinary response ────────┤
  │                                │                                │
  ├─ Order status change ─────────►│                                │
  │  (PAID → REFUNDED)             ├─ requireAdmin()               │
  │                                ├─ updateOrderStatus(orderId)    │
  │                                │   └─► $transaction:            │
  │                                │       Order.status = REFUNDED  │
  │                                │       Payment.status = REFUNDED│
  │◄── { success \| error } ──────┤                                │
```

## File Changes

### PR 1 — Admin Foundation (~12 files, ~400 lines)

| File | Action | Description |
|------|--------|-------------|
| `prisma/schema.prisma` | Modify | Add `publicId String?` to `ProductImage` model |
| `src/proxy.ts` | Modify | Add `/admin/:path*` matcher + ADMIN role check |
| `src/lib/auth/utils.ts` | Create | `requireAdmin()` helper — gets session, throws/redirects if not ADMIN |
| `src/lib/cloudinary/config.ts` | Create | Cloudinary v2 singleton; config + `uploadStream`, `destroy`, `resolveUrl` functions |
| `src/app/admin/layout.tsx` | Create | RSC session check + sidebar (Productos/Categorías/Órdenes) + SignOutButton; no Header/Footer |
| `src/app/admin/page.tsx` | Create | Redirect to `/admin/products` |
| `src/components/layout/HeaderAuth.tsx` | Modify | Add "Admin" link when `role === ADMIN` |
| `src/components/admin/RequireAdmin.tsx` | Create | Client wrapper; redirects non-ADMIN to `/ingresar` |
| `.env.example` | Modify | Add `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` |
| `src/components/ui/table.tsx` | Create | shadcn Table component (via CLI) |
| `src/components/ui/pagination.tsx` | Create | shadcn Pagination component (via CLI) |
| `src/components/ui/checkbox.tsx` | Create | shadcn Checkbox component (via CLI) |
| `src/components/ui/badge.tsx` | Create | shadcn Badge component (via CLI) |
| `src/components/ui/separator.tsx` | Create | shadcn Separator component (via CLI) |
| `src/components/ui/skeleton.tsx` | Create | shadcn Skeleton component (via CLI) |
| `src/components/ui/dropdown-menu.tsx` | Create | shadcn DropdownMenu component (via CLI) |

### PR 2 — Image Upload (~7 files, ~450 lines)

| File | Action | Description |
|------|--------|-------------|
| `src/app/api/admin/upload/route.ts` | Create | POST (upload) + DELETE handlers; ADMIN auth via `auth.api.getSession`; delegates to Cloudinary config |
| `src/hooks/use-image-upload.ts` | Create | Client hook: `upload(files)`, `remove(key)`, progress state, optimistic remove, sonner toasts |
| `src/hooks/use-image-reorder.ts` | Create | Client hook using `@dnd-kit/sortable`: `reorderImages(ids[])`, optimistic update via `reorderProductImages` Server Action |
| `src/components/admin/ImageUpload.tsx` | Create | Drag/click upload, preview grid with drag handle + sortable context for reordering, progress bar, remove button, empty/disabled states |
| `src/components/ui/input.tsx` | Create | shadcn Input (via CLI) |
| `src/components/ui/textarea.tsx` | Create | shadcn Textarea (via CLI) |
| `src/components/ui/select.tsx` | Create | shadcn Select (via CLI) |
| `src/components/ui/label.tsx` | Create | shadcn Label (via CLI) |
| `src/components/ui/switch.tsx` | Create | shadcn Switch (via CLI) |
| `src/components/ui/form.tsx` | Create | shadcn Form (via CLI) |

### PR 3 — Product CRUD (~9 files, ~750 lines)

| File | Action | Description |
|------|--------|-------------|
| `src/features/admin/products/schemas.ts` | Create | `productSchema` (name, description, price, stock, currency, brandId | brandName, categoryId, featured, active); `productFilterSchema` (search, page, limit) |
| `src/features/admin/products/queries.ts` | Create | `getAdminProducts(searchParams)` — paginated/filtered, default shows all products (Todos/Activos/Sin stock/Con stock); `getAdminProductById(id)` — full includes |
| `src/features/admin/products/actions.ts` | Create | `createProduct`, `updateProduct`, `toggleProductActive`, `toggleProductFeatured`, `archiveProduct`, `reorderProductImages(imageIds[])`, `createBrandInline(name)` |
| `src/components/admin/BrandCombobox.tsx` | Create | Combobox with "Crear nueva" option; selects existing brand or triggers `createBrandInline` action (auto-generates slug) |
| `src/components/admin/SidebarToggle.tsx` | Create | Collapsible sidebar toggle button; responsive state, CSS transition animation |
| `src/app/admin/products/page.tsx` | Create | Server component: table + search input + pagination; filter tabs (Todos/Activos/Sin stock/Con stock); toggle switches per row |
| `src/app/admin/products/new/page.tsx` | Create | Client form page: RHF + Zod + ImageUpload + BrandCombobox; redirects to list on success |
| `src/app/admin/products/[id]/edit/page.tsx` | Create | Client form page: pre-fills from `getAdminProductById`; same form layout with BrandCombobox |
| `src/components/admin/DataTable.tsx` | Create | Generic table wrapper: columns, data, pagination, skeleton loading |
| `src/components/ui/dialog.tsx` | Create | shadcn Dialog (via CLI) — for delete confirmation |
| `src/components/ui/command.tsx` | Create | shadcn Command (via CLI) — for BrandCombobox |

### PR 4 — Category CRUD (~6 files, ~350 lines)

| File | Action | Description |
|------|--------|-------------|
| `src/features/admin/categories/schemas.ts` | Create | `categorySchema` (name, description, featured, active); `categoryFilterSchema` |
| `src/features/admin/categories/queries.ts` | Create | `getAdminCategories(searchParams)`, `getAdminCategoryById(id)` |
| `src/features/admin/categories/actions.ts` | Create | `createCategory`, `updateCategory`, `toggleCategoryFeatured`, `archiveCategory` |
| `src/app/admin/categories/page.tsx` | Create | Table with search + pagination; featured toggle per row |
| `src/app/admin/categories/new/page.tsx` | Create | Client form: RHF + Zod + ImageUpload (maxImages=1) |
| `src/app/admin/categories/[id]/edit/page.tsx` | Create | Pre-filled edit form with current image |

### PR 5 — Order Management (~6 files, ~450 lines)

| File | Action | Description |
|------|--------|-------------|
| `src/features/admin/orders/schemas.ts` | Create | `orderFilterSchema` (status, dateFrom, dateTo, search, page) |
| `src/features/admin/orders/queries.ts` | Create | `getAdminOrders(searchParams)` — paginated + filtered by status/date/search |
| `src/features/admin/orders/actions.ts` | Create | `updateOrderToRefunded(orderId)` — validates PAID→REFUNDED, $transaction for Order + Payment |
| `src/app/admin/orders/page.tsx` | Create | Server component: filters (status dropdown + date range + search), table, pagination |
| `src/app/admin/orders/[orderNumber]/page.tsx` | Create | Server component: full detail (items, address, payment); AlertDialog confirmation before Refund; `OrderStatusBadge` reuse |
| `src/components/ui/sheet.tsx` | Create | shadcn Sheet (via CLI) — optional: order detail as slide-over |
| `src/components/ui/alert-dialog.tsx` | Create | shadcn AlertDialog (via CLI) — refund confirmation |

## Interfaces / Contracts

### Auth guard

```ts
// src/lib/auth/utils.ts
import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function requireAdmin(): Promise<{ id: string; name: string }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "ADMIN") {
    redirect("/ingresar");
  }
  return { id: session.user.id, name: session.user.name };
}
```

### Server Action signature (all CRUD)

```ts
// Every action returns: { success: true } | { error: string }
// Pattern identical to src/features/customers/actions.ts

export async function createProduct(data: ProductInput): Promise<{ success: true } | { error: string }>
export async function updateProduct(id: string, data: ProductInput): Promise<{ success: true } | { error: string }>
export async function archiveProduct(id: string): Promise<{ success: true } | { error: string }>
export async function toggleProductActive(id: string): Promise<{ success: true } | { error: string }>
```

### Product Zod schema

```ts
export const productSchema = z.object({
  name: z.string().min(1, "Ingresá el nombre del producto"),
  description: z.string().min(1, "Ingresá la descripción"),
  price: z.number().positive("El precio debe ser mayor a 0"),
  stock: z.number().int().min(0, "El stock no puede ser negativo"),
  currency: z.enum(["USD", "ARS"]).default("USD"),
  brandId: z.string().min(1, "Seleccioná una marca"),
  categoryId: z.string().min(1, "Seleccioná una categoría"),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
});
```

### Admin queries signature

```ts
// All return arrays or paginated responses — no auth check (caller is responsible)
export async function getAdminProducts(params: { search?: string; page?: number; limit?: number }): Promise<{ products: Product[]; total: number; page: number; totalPages: number }>
export async function getAdminProductById(id: string): Promise<Product | null>
export async function getAdminOrders(params: { search?: string; status?: OrderStatus; dateFrom?: string; dateTo?: string; page?: number }): Promise<{ orders: Order[]; total: number; page: number; totalPages: number }>
```

### ImageUpload component props

```ts
interface ImageUploadProps {
  value: string[];          // Cloudinary public IDs (or URLs)
  onChange: (value: string[]) => void;
  maxImages?: number;       // default: 10
  disabled?: boolean;
}
```

### API route contracts

```
POST /api/admin/upload
  Request: FormData { file: File }
  Response 200: { success: true, key: string, url: string }
  Response 401: { error: "No autorizado" }
  Response 400: { error: "..." }

DELETE /api/admin/upload
  Request: JSON { key: string }
  Response 200: { success: true }
  Response 401/403/500: { error: "..." }
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| **Unit** | Zod schemas (valid/invalid inputs, edge cases); `formatPrice` edge cases | Vitest — no DB needed |
| **Integration** | Server Actions (CRUD + auth guard); Cloudinary upload/delete; slug uniqueness | Vitest + Prisma test DB; mock Cloudinary SDK |
| **E2E** | Admin CRUD flows (product create→list→edit→archive); image upload preview; order refund transition; non-admin redirect | Playwright; seed test admin user |
| **Manual** | Cloudinary env var validation; mobile sidebar behavior | — |

## Migration / Rollout

### Prisma migration (single)

```bash
pnpm dlx prisma migrate dev --name add-productimage-publicid
# Adds: ProductImage.publicId String? (nullable, no data loss)
```

Optionally backfill existing images:
```sql
UPDATE "ProductImage" SET "publicId" = SPLIT_PART(url, '/', -1) WHERE "publicId" IS NULL;
```

### Cloudinary Env Vars

Add to `.env` (from `.env.example`):
```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Rollout Order (per PR)

1. **PR 1** (Foundation): Merge first — all shadcn components installed, proxy guard active, layout exists but routes return 404 until later PRs
2. **PR 2** (Image Upload): Cloudinary tested in isolation via API route
3. **PR 3** (Product CRUD): Depends on PR 2 (needs ImageUpload component)
4. **PR 4** (Category CRUD): Depends on PR 3 (reuses ImageUpload + admin patterns)
5. **PR 5** (Orders): Depends on PR 4 (reuses DataTable, admin layout)

## Open Questions

- [ ] Cloudinary account/credentials: Do we have them ready or need to create?
- [x] Product price: Stay as `Decimal` in Prisma (not integer cents). Already used everywhere.
- [x] Order "Refund" button: Add AlertDialog confirmation before the server action (Decision #14).
- [x] Admin Product listing: Show all products by default. Filter by Todos, Activos, Sin stock, Con stock (Decision #15).
- [x] Image URL storage: Store Cloudinary `public_id` in `ProductImage.publicId`, full transformed URL in `ProductImage.url`. Use `resolveImageUrl` utility pattern from `ejemplo-images-feature` (Decision #16).
