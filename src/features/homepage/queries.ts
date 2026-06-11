import db from "@/lib/db/client";

export async function getFeaturedCategories(limit = 6) {
  return db.category.findMany({
    where: { featured: true, active: true },
    take: limit,
    orderBy: { name: "asc" },
  });
}

export async function getFeaturedProducts(limit = 8) {
  return db.product.findMany({
    where: { featured: true, active: true },
    take: limit,
    include: {
      images: { orderBy: { order: "asc" }, take: 1 },
      category: { select: { name: true, slug: true } },
    },
    orderBy: { name: "asc" },
  });
}

export async function getActiveBrands() {
  return db.brand.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });
}
