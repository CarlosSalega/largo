// ---------------------------------------------------------------------------
// Admin category list — paginated table with search and row actions
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
import { CategoryRowActions } from "@/components/admin/CategoryRowActions";
import { getAdminCategoriesList } from "@/features/admin/queries";

// ── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Categorías | Admin | Largo",
  robots: { index: false, follow: false },
};

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;

  const page = Number(sp.page) || 1;
  const search = typeof sp.search === "string" ? sp.search : undefined;

  const { categories, totalPages } = await getAdminCategoriesList({
    page,
    search,
  });

  function pageHref(p: number) {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return `/admin/categories${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-card-foreground">
          Categorías
        </h1>
        <Button asChild>
          <Link href="/admin/categories/new">
            <Plus data-icon="inline-start" />
            Nueva categoría
          </Link>
        </Button>
      </div>

      {/* ── Search ──────────────────────────────────────────────────────── */}
      <form className="flex flex-1 gap-2 sm:max-w-sm" method="GET">
        <Input
          name="search"
          type="search"
          placeholder="Buscar categoría..."
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
            <Link href="/admin/categories">Limpiar</Link>
          </Button>
        )}
      </form>

      {/* ── Table ──────────────────────────────────────────────────────── */}
      {categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border py-16">
          <p className="text-muted-foreground">
            {search
              ? `No se encontraron categorías para "${search}"`
              : "No se encontraron categorías"}
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead className="text-center">Productos</TableHead>
                  <TableHead className="text-center">Destacado</TableHead>
                  <TableHead className="text-center">Activo</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    {/* Name */}
                    <TableCell className="font-medium">
                      <Link
                        href={`/admin/categories/${category.id}/edit`}
                        className="text-card-foreground transition-colors hover:text-primary"
                      >
                        {category.name}
                      </Link>
                    </TableCell>

                    {/* Slug */}
                    <TableCell className="text-muted-foreground font-mono text-xs">
                      {category.slug}
                    </TableCell>

                    {/* Product count */}
                    <TableCell className="text-center">
                      <Badge variant="secondary">
                        {category._count.products}
                      </Badge>
                    </TableCell>

                    {/* Featured toggle */}
                    <TableCell className="text-center">
                      <CategoryRowActions
                        categoryId={category.id}
                        featured={category.featured}
                        active={category.active}
                      />
                    </TableCell>

                    {/* Active badge */}
                    <TableCell className="text-center">
                      {category.active ? (
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        >
                          Activo
                        </Badge>
                      ) : (
                        <Badge variant="destructive">Inactivo</Badge>
                      )}
                    </TableCell>

                    {/* Edit link */}
                    <TableCell>
                      <Button asChild variant="outline" size="xs">
                        <Link
                          href={`/admin/categories/${category.id}/edit`}
                        >
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
                    if (p === 1 || p === totalPages) return true;
                    if (Math.abs(p - page) <= 1) return true;
                    return false;
                  })
                  .map((p, i, arr) => {
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
