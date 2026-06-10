// ---------------------------------------------------------------------------
// Slug helper — converts names to URL-safe identifiers
// ---------------------------------------------------------------------------
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ---------------------------------------------------------------------------
// Log a summary of the seeded database
// ---------------------------------------------------------------------------
export async function logSummary(
  prisma: { brand: { count: () => Promise<number> }; category: { count: () => Promise<number> }; product: { count: () => Promise<number> }; user: { count: () => Promise<number> }; productImage: { count: () => Promise<number> } },
  productsCount: number,
  categoriesCount: number,
  featuredProductsCount: number,
  featuredCategoriesCount: number,
): Promise<void> {
  const counts = {
    brands: await prisma.brand.count(),
    categories: await prisma.category.count(),
    products: await prisma.product.count(),
    users: await prisma.user.count(),
    productImages: await prisma.productImage.count(),
  };

  console.log("📊 Seed complete. Database summary:");
  console.log(`   Brands:        ${counts.brands}`);
  console.log(`   Categories:    ${counts.categories}`);
  console.log(`   Products:      ${counts.products}`);
  console.log(`   Product Images: ${counts.productImages}`);
  console.log(`   Users:         ${counts.users}`);
  console.log(`\n   Featured products:  ${featuredProductsCount}`);
  console.log(`   Featured categories: ${featuredCategoriesCount}`);
}
