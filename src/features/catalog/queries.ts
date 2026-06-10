import { Prisma } from "@prisma/client";
import db from "@/lib/db/client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CatalogQueryParams {
  search?: string;
  category?: string;
  brand?: string;
  sort?: "price_asc" | "price_desc" | "name_asc";
  page?: number;
  limit?: number;
}

export interface CatalogResponse {
  products: Awaited<ReturnType<typeof getCatalogProducts>>["products"];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ---------------------------------------------------------------------------
// Product query helper — maps sort options to Prisma orderBy
// ---------------------------------------------------------------------------
function buildOrderBy(
  sort: CatalogQueryParams["sort"]
): Prisma.ProductOrderByWithRelationInput {
  switch (sort) {
    case "price_asc":
      return { price: "asc" };
    case "price_desc":
      return { price: "desc" };
    case "name_asc":
    default:
      return { name: "asc" };
  }
}

// ---------------------------------------------------------------------------
// getCatalogProducts — paginated, filtered, sorted
// ---------------------------------------------------------------------------
export async function getCatalogProducts(params: CatalogQueryParams = {}) {
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(48, Math.max(1, params.limit ?? 12));
  const skip = (page - 1) * limit;

  const where: Prisma.ProductWhereInput = {
    active: true,
    ...(params.search && {
      OR: [
        { name: { contains: params.search, mode: "insensitive" } },
        { description: { contains: params.search, mode: "insensitive" } },
      ],
    }),
    ...(params.category && {
      category: { slug: params.category, active: true },
    }),
    ...(params.brand && {
      brand: { slug: params.brand, active: true },
    }),
  };

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      include: {
        images: { orderBy: { order: "asc" }, take: 1 },
        category: { select: { name: true, slug: true } },
        brand: { select: { name: true, slug: true } },
      },
      orderBy: buildOrderBy(params.sort),
      skip,
      take: limit,
    }),
    db.product.count({ where }),
  ]);

  return {
    products,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// ---------------------------------------------------------------------------
// getCategories — for filter dropdowns
// ---------------------------------------------------------------------------
export async function getCategories() {
  return db.category.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true },
  });
}

// ---------------------------------------------------------------------------
// getBrands — for filter dropdowns
// ---------------------------------------------------------------------------
export async function getBrands() {
  return db.brand.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true },
  });
}
