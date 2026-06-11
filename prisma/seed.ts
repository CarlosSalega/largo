// =============================================================================
// Largo Ecommerce MVP — Database Seed
// Run with: pnpm db:seed
// =============================================================================

import prisma from "./seed/client";
import { seedBrands } from "./seed/brands";
import { seedCategories } from "./seed/categories";
import { seedProducts } from "./seed/products";
import { seedUsers } from "./seed/users";
import { logSummary } from "./seed/utils";

async function main() {
  console.log("🌱 Seeding Largo database...\n");

  // 1. Brands
  const brands = await seedBrands(prisma);

  // 2. Categories
  const categoriesCtx = await seedCategories(prisma);

  // 3. Products
  const productsCtx = await seedProducts(prisma, {
    brands,
    categories: categoriesCtx,
  });

  // 4. Admin user
  await seedUsers(prisma);

  // 5. Summary
  await logSummary(
    prisma,
    productsCtx.count,
    categoriesCtx.count,
    productsCtx.featuredCount,
    categoriesCtx.featuredCount,
  );
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
