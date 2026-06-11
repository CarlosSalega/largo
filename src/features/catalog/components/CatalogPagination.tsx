"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CatalogPaginationProps {
  currentPage: number;
  totalPages: number;
}

export function CatalogPagination({
  currentPage,
  totalPages,
}: CatalogPaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const goToPage = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (page <= 1) {
        params.delete("page");
      } else {
        params.set("page", String(page));
      }
      router.push(`/catalog?${params.toString()}`);
    },
    [router, searchParams]
  );

  if (totalPages <= 1) return null;

  // Build page numbers with ellipsis
  const pages: (number | "ellipsis")[] = [];
  const range = 1; // Pages to show on each side of current

  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - range && i <= currentPage + range)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "ellipsis") {
      pages.push("ellipsis");
    }
  }

  const baseBtnClass =
    "inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors";

  return (
    <nav
      className="flex items-center justify-center gap-1 pt-8"
      aria-label="Paginación"
    >
      {/* Previous */}
      <button
        type="button"
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage <= 1}
        className={cn(
          baseBtnClass,
          "text-muted-foreground hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
        )}
        aria-label="Página anterior"
      >
        <ChevronLeft className="size-4" />
      </button>

      {/* Page numbers */}
      {pages.map((page, idx) => {
        if (page === "ellipsis") {
          return (
            <span
              key={`ellipsis-${idx}`}
              className="inline-flex h-9 w-9 items-center justify-center text-sm text-muted-foreground"
            >
              &hellip;
            </span>
          );
        }

        const isActive = page === currentPage;
        return (
          <button
            key={page}
            type="button"
            onClick={() => goToPage(page)}
            className={cn(
              baseBtnClass,
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
            aria-current={isActive ? "page" : undefined}
            aria-label={`Página ${page}`}
          >
            {page}
          </button>
        );
      })}

      {/* Next */}
      <button
        type="button"
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className={cn(
          baseBtnClass,
          "text-muted-foreground hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
        )}
        aria-label="Página siguiente"
      >
        <ChevronRight className="size-4" />
      </button>
    </nav>
  );
}
