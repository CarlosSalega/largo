import { Suspense } from "react";
import type { Metadata } from "next";
import { getCatalogProducts, getCategories, getBrands } from "@/features/catalog/queries";
import { ProductGrid } from "@/features/catalog/components/ProductGrid";
import { CatalogSearch } from "@/features/catalog/components/CatalogSearch";
import { CatalogFilters } from "@/features/catalog/components/CatalogFilters";
import { CatalogPagination } from "@/features/catalog/components/CatalogPagination";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CatalogPageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    brand?: string;
    sort?: string;
    page?: string;
  }>;
}

// ---------------------------------------------------------------------------
// Metadata (task 3.9)
// ---------------------------------------------------------------------------

export const metadata: Metadata = {
  title: "Products",
  description:
    "Browse our full catalog of premium technology products. Smartphones, laptops, audio, tablets, monitors, and accessories from Apple, Samsung, Sony, LG, and Dell.",
  openGraph: {
    title: "Products | Largo",
    description:
      "Browse our full catalog of premium technology products.",
    type: "website",
    locale: "en_US",
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const VALID_SORTS = ["price_asc", "price_desc", "name_asc"] as const;
type ValidSort = (typeof VALID_SORTS)[number];

function parseSort(raw: string | undefined): ValidSort | undefined {
  if (!raw) return undefined;
  return VALID_SORTS.includes(raw as ValidSort) ? (raw as ValidSort) : undefined;
}

function parsePage(raw: string | undefined): number {
  if (!raw) return 1;
  const n = parseInt(raw, 10);
  return isNaN(n) || n < 1 ? 1 : n;
}

// ---------------------------------------------------------------------------
// Client filter bar — wrapped in Suspense because it uses useSearchParams()
// ---------------------------------------------------------------------------

async function CatalogFilterBar() {
  const [categories, brands] = await Promise.all([
    getCategories(),
    getBrands(),
  ]);

  return <CatalogFilters categories={categories} brands={brands} />;
}

function FilterBarSkeleton() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="h-10 w-44 animate-pulse rounded-lg bg-muted" />
      <div className="h-10 w-32 animate-pulse rounded-lg bg-muted" />
      <div className="h-10 w-40 animate-pulse rounded-lg bg-muted" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Client search bar — wrapped in Suspense because it uses useSearchParams()
// ---------------------------------------------------------------------------

function SearchBarSkeleton() {
  return (
    <div className="h-10 w-full max-w-md animate-pulse rounded-lg bg-muted" />
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = await searchParams;

  const sort = parseSort(params.sort);
  const page = parsePage(params.page);

  const { products, total, totalPages } = await getCatalogProducts({
    search: params.search,
    category: params.category,
    brand: params.brand,
    sort,
    page,
    limit: 12,
  });

  return (
    <div className="section-padding">
      <div className="section-container">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Products
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            {total > 0
              ? `Showing ${products.length} of ${total} products`
              : "Browse our catalog"}
          </p>
        </div>

        {/* Controls */}
        <div className="mb-8 space-y-4">
          <Suspense fallback={<SearchBarSkeleton />}>
            <CatalogSearch />
          </Suspense>

          <Suspense fallback={<FilterBarSkeleton />}>
            <CatalogFilterBar />
          </Suspense>
        </div>

        {/* Grid */}
        <ProductGrid products={products} />

        {/* Pagination */}
        {totalPages > 1 && (
          <Suspense
            fallback={
              <div className="flex items-center justify-center gap-1 pt-8">
                <div className="h-9 w-9 animate-pulse rounded-lg bg-muted" />
                <div className="h-9 w-9 animate-pulse rounded-lg bg-muted" />
                <div className="h-9 w-9 animate-pulse rounded-lg bg-muted" />
              </div>
            }
          >
            <CatalogPagination currentPage={page} totalPages={totalPages} />
          </Suspense>
        )}
      </div>
    </div>
  );
}
