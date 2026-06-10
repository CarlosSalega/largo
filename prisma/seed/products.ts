import type { PrismaClient, Product, Brand } from "@prisma/client";
import { slugify } from "./utils";
import type { CategoriesContext } from "./categories";

// ---------------------------------------------------------------------------
// Context needed by seedProducts
// ---------------------------------------------------------------------------

export interface ProductsContext {
  brands: Brand[];
  categories: CategoriesContext;
}

// ---------------------------------------------------------------------------
// Product definitions
// ---------------------------------------------------------------------------

interface ProductSeedData {
  name: string;
  description: string;
  price: number;
  stock: number;
  featured: boolean;
  brandName: string;
  categoryName: string;
  currency: string;
  images: string[];
}

// ---------------------------------------------------------------------------
// Seed products
// ---------------------------------------------------------------------------

export async function seedProducts(
  prisma: PrismaClient,
  ctx: ProductsContext,
): Promise<{ count: number; featuredCount: number }> {
  const { brands, categories } = ctx;

  function brandId(name: string): string {
    return brands.find((b) => b.name === name)!.id;
  }

  const cat = categories.ids;

  const productsData: ProductSeedData[] = [
    // Smartphones
    {
      name: "iPhone 16 Pro",
      description:
        "Apple's latest pro smartphone with A18 Pro chip, 48MP camera, and titanium design.",
      price: 1299.99,
      stock: 25,
      featured: true,
      brandName: "Apple",
      categoryName: "Smartphones",
      currency: "USD",
      images: ["https://res.cloudinary.com/demo/image/upload/products/iphone16pro-1.jpg"],
    },
    {
      name: "Samsung Galaxy S25 Ultra",
      description:
        "Samsung's flagship with 200MP camera, S Pen support, and Galaxy AI.",
      price: 1199.99,
      stock: 20,
      featured: true,
      brandName: "Samsung",
      categoryName: "Smartphones",
      currency: "USD",
      images: ["https://res.cloudinary.com/demo/image/upload/products/s25ultra-1.jpg"],
    },
    {
      name: "iPhone 16",
      description: "The standard iPhone 16 with A18 chip and 48MP camera.",
      price: 899.99,
      stock: 35,
      featured: false,
      brandName: "Apple",
      categoryName: "Smartphones",
      currency: "USD",
      images: ["https://res.cloudinary.com/demo/image/upload/products/iphone16-1.jpg"],
    },
    // Laptops
    {
      name: "MacBook Pro 16-inch M4",
      description:
        "Apple's most powerful laptop with M4 Max chip, 32GB RAM, 1TB SSD.",
      price: 2499.99,
      stock: 10,
      featured: true,
      brandName: "Apple",
      categoryName: "Laptops",
      currency: "USD",
      images: ["https://res.cloudinary.com/demo/image/upload/products/macbookpro16-1.jpg"],
    },
    {
      name: "Dell XPS 15",
      description:
        'Premium ultrabook with Intel Core Ultra 9, 32GB RAM, 1TB SSD, 15.6" OLED display.',
      price: 1899.99,
      stock: 8,
      featured: false,
      brandName: "Dell",
      categoryName: "Laptops",
      currency: "USD",
      images: ["https://res.cloudinary.com/demo/image/upload/products/dellxps15-1.jpg"],
    },
    {
      name: "Samsung Galaxy Book5 Pro",
      description:
        "Samsung's premium laptop with Intel Core Ultra 7, 16GB RAM, 512GB SSD.",
      price: 1499.99,
      stock: 12,
      featured: false,
      brandName: "Samsung",
      categoryName: "Laptops",
      currency: "USD",
      images: ["https://res.cloudinary.com/demo/image/upload/products/galaxybook5-1.jpg"],
    },
    // Audio
    {
      name: "Sony WH-1000XM6",
      description:
        "Industry-leading noise cancelling headphones with 40-hour battery life.",
      price: 349.99,
      stock: 50,
      featured: true,
      brandName: "Sony",
      categoryName: "Audio",
      currency: "USD",
      images: ["https://res.cloudinary.com/demo/image/upload/products/sonywh1000xm6-1.jpg"],
    },
    {
      name: "AirPods Pro 3",
      description:
        "Apple's premium wireless earbuds with active noise cancellation and spatial audio.",
      price: 249.99,
      stock: 40,
      featured: true,
      brandName: "Apple",
      categoryName: "Audio",
      currency: "USD",
      images: ["https://res.cloudinary.com/demo/image/upload/products/airpodspro3-1.jpg"],
    },
    {
      name: "Samsung Galaxy Buds3 Pro",
      description:
        "Premium wireless earbuds with intelligent ANC and 360 audio.",
      price: 199.99,
      stock: 30,
      featured: false,
      brandName: "Samsung",
      categoryName: "Audio",
      currency: "USD",
      images: ["https://res.cloudinary.com/demo/image/upload/products/buds3pro-1.jpg"],
    },
    // Tablets
    {
      name: "iPad Pro M4 13-inch",
      description:
        "Apple's most powerful tablet with M4 chip, Liquid Retina XDR display.",
      price: 1299.99,
      stock: 15,
      featured: true,
      brandName: "Apple",
      categoryName: "Tablets",
      currency: "USD",
      images: ["https://res.cloudinary.com/demo/image/upload/products/ipadprom4-1.jpg"],
    },
    {
      name: "Samsung Galaxy Tab S10 Ultra",
      description:
        'Samsung\'s largest tablet with 14.6" Dynamic AMOLED display and S Pen.',
      price: 1099.99,
      stock: 10,
      featured: false,
      brandName: "Samsung",
      categoryName: "Tablets",
      currency: "USD",
      images: ["https://res.cloudinary.com/demo/image/upload/products/tabs10ultra-1.jpg"],
    },
    // Monitors
    {
      name: "LG UltraFine 5K 27-inch",
      description:
        "Professional 5K monitor with Thunderbolt 4, ideal for creative work.",
      price: 1299.99,
      stock: 6,
      featured: true,
      brandName: "LG",
      categoryName: "Monitors",
      currency: "USD",
      images: ["https://res.cloudinary.com/demo/image/upload/products/lgultrafine5k-1.jpg"],
    },
    {
      name: "Samsung Odyssey G9 49-inch",
      description:
        "Super ultra-wide curved gaming monitor with 240Hz refresh rate.",
      price: 1499.99,
      stock: 4,
      featured: false,
      brandName: "Samsung",
      categoryName: "Monitors",
      currency: "USD",
      images: ["https://res.cloudinary.com/demo/image/upload/products/odysseyg9-1.jpg"],
    },
    {
      name: "Dell UltraSharp U3223QE 32-inch",
      description:
        "4K USB-C hub monitor with IPS Black technology for deeper blacks.",
      price: 899.99,
      stock: 8,
      featured: false,
      brandName: "Dell",
      categoryName: "Monitors",
      currency: "USD",
      images: ["https://res.cloudinary.com/demo/image/upload/products/dellu3223qe-1.jpg"],
    },
    // Accessories
    {
      name: "Apple MagSafe Charger",
      description:
        "Wireless charger that snaps magnetically to iPhone 12 and later.",
      price: 39.99,
      stock: 100,
      featured: false,
      brandName: "Apple",
      categoryName: "Accessories",
      currency: "USD",
      images: ["https://res.cloudinary.com/demo/image/upload/products/magsafe-1.jpg"],
    },
  ];

  for (const p of productsData) {
    await prisma.product.upsert({
      where: { slug: slugify(p.name) },
      update: {},
      create: {
        name: p.name,
        slug: slugify(p.name),
        description: p.description,
        price: p.price,
        stock: p.stock,
        featured: p.featured,
        brandId: brandId(p.brandName),
        categoryId: cat[p.categoryName],
        images: {
          create: p.images.map((url, idx) => ({
            url,
            alt: `${p.name} image ${idx + 1}`,
            order: idx,
          })),
        },
      },
    });
  }

  console.log(`✅ Created ${productsData.length} products with images`);

  return {
    count: productsData.length,
    featuredCount: productsData.filter((p) => p.featured).length,
  };
}
