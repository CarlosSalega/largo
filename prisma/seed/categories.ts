import type { PrismaClient } from "@prisma/client";
import { slugify } from "./utils";

// ---------------------------------------------------------------------------
// Category definitions
// ---------------------------------------------------------------------------

const categoriesData = [
  {
    name: "Smartphones",
    description: "Latest smartphones from top brands",
    image: "https://res.cloudinary.com/demo/image/upload/categories/smartphones.jpg",
    featured: true,
  },
  {
    name: "Laptops",
    description: "Portable computers for work and play",
    image: "https://res.cloudinary.com/demo/image/upload/categories/laptops.jpg",
    featured: true,
  },
  {
    name: "Audio",
    description: "Headphones, speakers, and audio equipment",
    image: "https://res.cloudinary.com/demo/image/upload/categories/audio.jpg",
    featured: true,
  },
  {
    name: "Tablets",
    description: "iPads and Android tablets",
    image: "https://res.cloudinary.com/demo/image/upload/categories/tablets.jpg",
    featured: false,
  },
  {
    name: "Monitors",
    description: "Displays for productivity and gaming",
    image: "https://res.cloudinary.com/demo/image/upload/categories/monitors.jpg",
    featured: true,
  },
  {
    name: "Accessories",
    description: "Cases, chargers, cables, and more",
    image: "https://res.cloudinary.com/demo/image/upload/categories/accessories.jpg",
    featured: false,
  },
];

// ---------------------------------------------------------------------------
// Context returned by seedCategories (used by seedProducts)
// ---------------------------------------------------------------------------

export interface CategoriesContext {
  ids: Record<string, string>;
  count: number;
  featuredCount: number;
}

// ---------------------------------------------------------------------------
// Seed categories
// ---------------------------------------------------------------------------

export async function seedCategories(prisma: PrismaClient): Promise<CategoriesContext> {
  const categoriesMap: Record<string, string> = {};

  for (const c of categoriesData) {
    const cat = await prisma.category.upsert({
      where: { name: c.name },
      update: {},
      create: {
        name: c.name,
        slug: slugify(c.name),
        description: c.description,
        image: c.image,
        featured: c.featured,
      },
    });
    categoriesMap[c.name] = cat.id;
  }

  console.log(`✅ Created ${categoriesData.length} categories`);

  return {
    ids: categoriesMap,
    count: categoriesData.length,
    featuredCount: categoriesData.filter((c) => c.featured).length,
  };
}
