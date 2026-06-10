import type { PrismaClient, Brand } from "@prisma/client";
import { slugify } from "./utils";

// ---------------------------------------------------------------------------
// Brand definitions
// ---------------------------------------------------------------------------

const brandsData = [
  { name: "Apple", logo: "https://res.cloudinary.com/demo/image/upload/brands/apple.png" },
  { name: "Samsung", logo: "https://res.cloudinary.com/demo/image/upload/brands/samsung.png" },
  { name: "Sony", logo: "https://res.cloudinary.com/demo/image/upload/brands/sony.png" },
  { name: "LG", logo: "https://res.cloudinary.com/demo/image/upload/brands/lg.png" },
  { name: "Dell", logo: "https://res.cloudinary.com/demo/image/upload/brands/dell.png" },
];

// ---------------------------------------------------------------------------
// Seed brands
// ---------------------------------------------------------------------------

export async function seedBrands(prisma: PrismaClient): Promise<Brand[]> {
  const brands = await Promise.all(
    brandsData.map((b) =>
      prisma.brand.upsert({
        where: { name: b.name },
        update: {},
        create: {
          name: b.name,
          slug: slugify(b.name),
          logo: b.logo,
        },
      }),
    ),
  );
  console.log(`✅ Created ${brands.length} brands`);
  return brands;
}
