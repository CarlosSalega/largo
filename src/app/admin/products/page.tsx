// ---------------------------------------------------------------------------
// Admin product list — paginated table with search, filters, and row actions
// Server Component — fetches data via URL searchParams
// ---------------------------------------------------------------------------

import Link from "next/link";
import type { Metadata } from "next";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ProductRowActions } from "@/components/admin/ProductRowActions";
import { getAdminProducts } from "@/features/admin/queries";
import { formatPrice } from "@/lib/formatPrice";
import { SafeImage } from "@/components/ui/safe-image";
import { resolveCloudinaryUrl } from "@/lib/cloudinary/resolve-url";

// ── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Productos | Admin | Largo",
  robots: { index: false, follow: false },
};

// ── Constants ────────────────────────────────────────────────────────────────

const FILTERS = [
  { key: "all", label: "Todos" },
  { key: "active", label: "Activos" },
  { key: "in_stock", label: "Con stock" },
  { key: "out_of_stock", label: "Sin stock" },
] as const;

type FilterKey = (typeof FILTERS)[number]["key"];

// ── Helpers ──────────────────────────────────────────────────────────────────

function resolveFilter(
  tab: string | undefined,
): { status?: "active" | "inactive" | "all"; stock?: "in_stock" | "out_of_stock" | "all" } {
  switch (tab) {
    case "active":
      return { status: "active", stock: "all" };
    case "in_stock":
      return { status: "all", stock: "in_stock" };
    case "out_of_stock":
      return { status: "all", stock: "out_of_stock" };
    default:
      return { status: "all", stock: "all" };
  }
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;

  const page = Number(sp.page) || 1;
  const search = typeof sp.search === "string" ? sp.search : undefined;
  const tab = typeof sp.tab === "string" ? sp.tab : "all";

  const filters = resolveFilter(tab);

  const { products, totalPages } = await getAdminProducts({
    page,
    search,
    status: filters.status,
    stock: filters.stock,
  });

  // Build params for pagination links (preserve current tab + search)
  const linkParams = new URLSearchParams();
  if (tab && tab !== "all") linkParams.set("tab", tab);
  if (search) linkParams.set("search", search);

  function pageHref(p: number) {
    const params = new URLSearchParams(linkParams);
    if (p > 1) params.set("page", String(p));
    else params.delete("page");
    const qs = params.toString();
    return `/admin/products${qs ? `?${qs}` : ""}`;
  }

  function filterHref(fk: FilterKey) {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (fk !== "all") params.set("tab", fk);
    const qs = params.toString();
    return `/admin/products${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-card-foreground">Productos</h1>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus data-icon="inline-start" />
            Nuevo producto
          </Link>
        </Button>
      </div>

      {/* ── Search + Filters ───────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search form */}
        <form className="flex flex-1 gap-2 sm:max-w-sm" method="GET">
          {tab && tab !== "all" && (
            <input type="hidden" name="tab" value={tab} />
          )}
          <Input
            name="search"
            type="search"
            placeholder="Buscar producto..."
            defaultValue={search ?? ""}
            className="flex-1"
          />
          <Button type="submit" variant="outline" size="sm">
            Buscar
          </Button>
          {search && (
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
            >
              <Link href={filterHref(tab as FilterKey)}>Limpiar</Link>
            </Button>
          )}
        </form>

        {/* Filter tabs */}
        <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-0.5">
          {FILTERS.map((f) => (
            <Link
              key={f.key}
              href={filterHref(f.key)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                tab === f.key
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-card-foreground"
              }`}
            >
              {f.label}
            </Link>
          ))}
        </div>
      </div>

      {/* ── Table ──────────────────────────────────────────────────────── */}
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border py-16">
          <p className="text-muted-foreground">
            {search
              ? `No se encontraron productos para "${search}"`
              : "No se encontraron productos"}
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Marca</TableHead>
                  <TableHead className="text-center">Destacado</TableHead>
                  <TableHead className="text-center">Activo</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    {/* Thumbnail */}
                    <TableCell>
                      {product.images[0] ? (
                        <div className="relative size-10 overflow-hidden rounded-md">
                          <SafeImage
                            src={resolveCloudinaryUrl(
                              product.images[0].publicId ?? product.images[0].url,
                              "thumbnail",
                            )}
                            alt={product.images[0].alt ?? product.name}
                          />
                        </div>
                      ) : (
                        <div className="flex size-10 items-center justify-center rounded-md bg-muted">
                          <span className="text-xs text-muted-foreground">—</span>
                        </div>
                      )}
                    </TableCell>

                    {/* Name */}
                    <TableCell className="font-medium">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="text-card-foreground transition-colors hover:text-primary"
                      >
                        {product.name}
                      </Link>
                    </TableCell>

                    {/* Price */}
                    <TableCell className="tabular-nums">
                      {formatPrice(product.price, product.currency)}
                    </TableCell>

                    {/* Stock */}
                    <TableCell>
                      <Badge
                        variant={product.stock > 0 ? "secondary" : "destructive"}
                      >
                        {product.stock}
                      </Badge>
                    </TableCell>

                    {/* Category */}
                    <TableCell className="text-muted-foreground">
                      {product.category.name}
                    </TableCell>

                    {/* Brand */}
                    <TableCell className="text-muted-foreground">
                      {product.brand.name}
                    </TableCell>

                    {/* Featured toggle */}
                    <TableCell className="text-center">
                      <ProductRowActions
                        productId={product.id}
                        featured={product.featured}
                        active={product.active}
                      />
                    </TableCell>

                    {/* Active toggle — handled by ProductRowActions */}
                    <TableCell />

                    {/* Actions */}
                    <TableCell>
                      <Button asChild variant="outline" size="xs">
                        <Link href={`/admin/products/${product.id}/edit`}>
                          Editar
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* ── Pagination ──────────────────────────────────────────────── */}
          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                {page > 1 && (
                  <PaginationItem>
                    <PaginationPrevious
                      href={pageHref(page - 1)}
                      text="Anterior"
                    />
                  </PaginationItem>
                )}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => {
                    // Show first, last, current, and neighbors
                    if (p === 1 || p === totalPages) return true;
                    if (Math.abs(p - page) <= 1) return true;
                    return false;
                  })
                  .map((p, i, arr) => {
                    // Add ellipsis gaps
                    const showEllipsis =
                      i > 0 && p - (arr[i - 1] ?? 0) > 1;

                    return (
                      <PaginationItem key={p}>
                        {showEllipsis && (
                          <span className="flex size-8 items-center justify-center text-muted-foreground">
                            ...
                          </span>
                        )}
                        <PaginationLink
                          href={pageHref(p)}
                          isActive={p === page}
                        >
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                {page < totalPages && (
                  <PaginationItem>
                    <PaginationNext
                      href={pageHref(page + 1)}
                      text="Siguiente"
                    />
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  );
}
