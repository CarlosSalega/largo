import db from "@/lib/db/client";
import type { Product, ProductImage, Category, Brand } from "@/lib/db/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ProductDetailProduct = Product & {
  images: ProductImage[];
  category: Pick<Category, "name" | "slug">;
  brand: Pick<Brand, "name" | "slug">;
};

export type RelatedProduct = Product & {
  images: ProductImage[];
  category: Pick<Category, "name" | "slug">;
  brand: Pick<Brand, "name" | "slug">;
};

// ---------------------------------------------------------------------------
// Helpers — re-exported from centralized lib
// ---------------------------------------------------------------------------

export { formatPrice, priceAsString } from "@/lib/formatPrice";

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export async function getProductBySlug(
  slug: string
): Promise<ProductDetailProduct | null> {
  return db.product.findUnique({
    where: { slug, active: true },
    include: {
      images: { orderBy: { order: "asc" } },
      category: { select: { name: true, slug: true } },
      brand: { select: { name: true, slug: true } },
    },
  });
}

export async function getAllProductSlugs(): Promise<string[]> {
  const products = await db.product.findMany({
    where: { active: true },
    select: { slug: true },
  });
  return products.map((p) => p.slug);
}

export async function getRelatedProducts(
  currentSlug: string,
  categoryId: string
): Promise<RelatedProduct[]> {
  return db.product.findMany({
    where: {
      categoryId,
      active: true,
      slug: { not: currentSlug },
    },
    take: 4,
    include: {
      images: { orderBy: { order: "asc" }, take: 1 },
      category: { select: { name: true, slug: true } },
      brand: { select: { name: true, slug: true } },
    },
    orderBy: { name: "asc" },
  });
}
