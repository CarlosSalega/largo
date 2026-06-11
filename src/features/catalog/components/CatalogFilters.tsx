"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface FilterOption {
  slug: string;
  name: string;
}

interface CatalogFiltersProps {
  categories: FilterOption[];
  brands: FilterOption[];
}

const sortOptions = [
  { value: "", label: "Default" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "name_asc", label: "Name: A-Z" },
] as const;

export function CatalogFilters({ categories, brands }: CatalogFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get("category") ?? "";
  const currentBrand = searchParams.get("brand") ?? "";
  const currentSort = searchParams.get("sort") ?? "";
  const currentSearch = searchParams.get("search") ?? "";

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      // Reset to page 1 when filters change
      if (key !== "page") {
        params.set("page", "1");
      }

      router.push(`/catalog?${params.toString()}`);
    },
    [router, searchParams]
  );

  const selectClass =
    "rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20 transition-colors";

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Category filter */}
      {categories.length > 0 && (
        <select
          value={currentCategory}
          onChange={(e) => updateParam("category", e.target.value)}
          className={selectClass}
          aria-label="Filter by category"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.slug} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>
      )}

      {/* Brand filter */}
      {brands.length > 0 && (
        <select
          value={currentBrand}
          onChange={(e) => updateParam("brand", e.target.value)}
          className={selectClass}
          aria-label="Filter by brand"
        >
          <option value="">All Brands</option>
          {brands.map((b) => (
            <option key={b.slug} value={b.slug}>
              {b.name}
            </option>
          ))}
        </select>
      )}

      {/* Sort */}
      <select
        value={currentSort}
        onChange={(e) => updateParam("sort", e.target.value)}
        className={selectClass}
        aria-label="Sort products"
      >
        {sortOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Active search display */}
      {currentSearch && (
        <div className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">
            &ldquo;{currentSearch}&rdquo;
          </span>
          <button
            type="button"
            onClick={() => updateParam("search", "")}
            className="ml-0.5 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear search filter"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
