// =============================================================================
// Largo Ecommerce MVP — Database Seed
// Run with: pnpm db:seed
// =============================================================================

import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { randomUUID } from "crypto";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

// ---------------------------------------------------------------------------
// Slug helper
// ---------------------------------------------------------------------------
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ---------------------------------------------------------------------------
// Main seed
// ---------------------------------------------------------------------------
async function main() {
  console.log("🌱 Seeding Largo database...\n");

  // -----------------------------------------------------------------------
  // 1. BRANDS
  // -----------------------------------------------------------------------
  const brands = await Promise.all(
    [
      { name: "Apple", logo: "https://res.cloudinary.com/demo/image/upload/brands/apple.png" },
      { name: "Samsung", logo: "https://res.cloudinary.com/demo/image/upload/brands/samsung.png" },
      { name: "Sony", logo: "https://res.cloudinary.com/demo/image/upload/brands/sony.png" },
      { name: "LG", logo: "https://res.cloudinary.com/demo/image/upload/brands/lg.png" },
      { name: "Dell", logo: "https://res.cloudinary.com/demo/image/upload/brands/dell.png" },
    ].map((b) =>
      prisma.brand.upsert({
        where: { name: b.name },
        update: {},
        create: {
          name: b.name,
          slug: slugify(b.name),
          logo: b.logo,
        },
      })
    )
  );
  console.log(`✅ Created ${brands.length} brands`);

  // -----------------------------------------------------------------------
  // 2. CATEGORIES
  // -----------------------------------------------------------------------
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

  // -----------------------------------------------------------------------
  // 3. PRODUCTS (across categories and brands)
  // -----------------------------------------------------------------------
  const appleId = brands.find((b) => b.name === "Apple")!.id;
  const samsungId = brands.find((b) => b.name === "Samsung")!.id;
  const sonyId = brands.find((b) => b.name === "Sony")!.id;
  const lgId = brands.find((b) => b.name === "LG")!.id;
  const dellId = brands.find((b) => b.name === "Dell")!.id;

  const smartphonesId = categoriesMap["Smartphones"];
  const laptopsId = categoriesMap["Laptops"];
  const audioId = categoriesMap["Audio"];
  const tabletsId = categoriesMap["Tablets"];
  const monitorsId = categoriesMap["Monitors"];
  const accessoriesId = categoriesMap["Accessories"];

  const productsData = [
    // Smartphones
    {
      name: "iPhone 16 Pro",
      description: "Apple's latest pro smartphone with A18 Pro chip, 48MP camera, and titanium design.",
      price: 1299.99,
      stock: 25,
      featured: true,
      brandId: appleId,
      categoryId: smartphonesId,
      images: ["https://res.cloudinary.com/demo/image/upload/products/iphone16pro-1.jpg"],
    },
    {
      name: "Samsung Galaxy S25 Ultra",
      description: "Samsung's flagship with 200MP camera, S Pen support, and Galaxy AI.",
      price: 1199.99,
      stock: 20,
      featured: true,
      brandId: samsungId,
      categoryId: smartphonesId,
      images: ["https://res.cloudinary.com/demo/image/upload/products/s25ultra-1.jpg"],
    },
    {
      name: 'iPhone 16',
      description: "The standard iPhone 16 with A18 chip and 48MP camera.",
      price: 899.99,
      stock: 35,
      featured: false,
      brandId: appleId,
      categoryId: smartphonesId,
      images: ["https://res.cloudinary.com/demo/image/upload/products/iphone16-1.jpg"],
    },
    // Laptops
    {
      name: "MacBook Pro 16-inch M4",
      description: "Apple's most powerful laptop with M4 Max chip, 32GB RAM, 1TB SSD.",
      price: 2499.99,
      stock: 10,
      featured: true,
      brandId: appleId,
      categoryId: laptopsId,
      images: ["https://res.cloudinary.com/demo/image/upload/products/macbookpro16-1.jpg"],
    },
    {
      name: "Dell XPS 15",
      description: "Premium ultrabook with Intel Core Ultra 9, 32GB RAM, 1TB SSD, 15.6\" OLED display.",
      price: 1899.99,
      stock: 8,
      featured: false,
      brandId: dellId,
      categoryId: laptopsId,
      images: ["https://res.cloudinary.com/demo/image/upload/products/dellxps15-1.jpg"],
    },
    {
      name: "Samsung Galaxy Book5 Pro",
      description: "Samsung's premium laptop with Intel Core Ultra 7, 16GB RAM, 512GB SSD.",
      price: 1499.99,
      stock: 12,
      featured: false,
      brandId: samsungId,
      categoryId: laptopsId,
      images: ["https://res.cloudinary.com/demo/image/upload/products/galaxybook5-1.jpg"],
    },
    // Audio
    {
      name: "Sony WH-1000XM6",
      description: "Industry-leading noise cancelling headphones with 40-hour battery life.",
      price: 349.99,
      stock: 50,
      featured: true,
      brandId: sonyId,
      categoryId: audioId,
      images: ["https://res.cloudinary.com/demo/image/upload/products/sonywh1000xm6-1.jpg"],
    },
    {
      name: "AirPods Pro 3",
      description: "Apple's premium wireless earbuds with active noise cancellation and spatial audio.",
      price: 249.99,
      stock: 40,
      featured: true,
      brandId: appleId,
      categoryId: audioId,
      images: ["https://res.cloudinary.com/demo/image/upload/products/airpodspro3-1.jpg"],
    },
    {
      name: "Samsung Galaxy Buds3 Pro",
      description: "Premium wireless earbuds with intelligent ANC and 360 audio.",
      price: 199.99,
      stock: 30,
      featured: false,
      brandId: samsungId,
      categoryId: audioId,
      images: ["https://res.cloudinary.com/demo/image/upload/products/buds3pro-1.jpg"],
    },
    // Tablets
    {
      name: "iPad Pro M4 13-inch",
      description: "Apple's most powerful tablet with M4 chip, Liquid Retina XDR display.",
      price: 1299.99,
      stock: 15,
      featured: true,
      brandId: appleId,
      categoryId: tabletsId,
      images: ["https://res.cloudinary.com/demo/image/upload/products/ipadprom4-1.jpg"],
    },
    {
      name: "Samsung Galaxy Tab S10 Ultra",
      description: "Samsung's largest tablet with 14.6\" Dynamic AMOLED display and S Pen.",
      price: 1099.99,
      stock: 10,
      featured: false,
      brandId: samsungId,
      categoryId: tabletsId,
      images: ["https://res.cloudinary.com/demo/image/upload/products/tabs10ultra-1.jpg"],
    },
    // Monitors
    {
      name: "LG UltraFine 5K 27-inch",
      description: "Professional 5K monitor with Thunderbolt 4, ideal for creative work.",
      price: 1299.99,
      stock: 6,
      featured: true,
      brandId: lgId,
      categoryId: monitorsId,
      images: ["https://res.cloudinary.com/demo/image/upload/products/lgultrafine5k-1.jpg"],
    },
    {
      name: "Samsung Odyssey G9 49-inch",
      description: "Super ultra-wide curved gaming monitor with 240Hz refresh rate.",
      price: 1499.99,
      stock: 4,
      featured: false,
      brandId: samsungId,
      categoryId: monitorsId,
      images: ["https://res.cloudinary.com/demo/image/upload/products/odysseyg9-1.jpg"],
    },
    {
      name: "Dell UltraSharp U3223QE 32-inch",
      description: "4K USB-C hub monitor with IPS Black technology for deeper blacks.",
      price: 899.99,
      stock: 8,
      featured: false,
      brandId: dellId,
      categoryId: monitorsId,
      images: ["https://res.cloudinary.com/demo/image/upload/products/dellu3223qe-1.jpg"],
    },
    // Accessories
    {
      name: "Apple MagSafe Charger",
      description: "Wireless charger that snaps magnetically to iPhone 12 and later.",
      price: 39.99,
      stock: 100,
      featured: false,
      brandId: appleId,
      categoryId: accessoriesId,
      images: ["https://res.cloudinary.com/demo/image/upload/products/magsafe-1.jpg"],
    },
  ];

  for (const p of productsData) {
    const created = await prisma.product.upsert({
      where: { slug: slugify(p.name) },
      update: {},
      create: {
        name: p.name,
        slug: slugify(p.name),
        description: p.description,
        price: p.price,
        stock: p.stock,
        featured: p.featured,
        brandId: p.brandId,
        categoryId: p.categoryId,
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

  // -----------------------------------------------------------------------
  // 4. ADMIN USER
  // -----------------------------------------------------------------------
  const adminEmail = "admin@largo.com";
  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Admin",
      // IMPORTANT: Replace with a properly hashed password in production!
      // This is a placeholder for development only.
      // Use: bcrypt.hashSync("Admin123!", 10)
      passwordHash: "$2b$10$PLACEHOLDER_HASH_REPLACE_IN_PRODUCTION",
      role: "ADMIN",
      emailVerified: true,
    },
  });
  console.log(`✅ Admin user created: ${adminUser.email} (role: ${adminUser.role})`);
  console.log(`   ⚠️  Password hash is a placeholder — replace for production use.\n`);

  // -----------------------------------------------------------------------
  // 5. SUMMARY
  // -----------------------------------------------------------------------
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
  console.log(`\n   Featured products:  ${productsData.filter((p) => p.featured).length}`);
  console.log(`   Featured categories: ${categoriesData.filter((c) => c.featured).length}`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
