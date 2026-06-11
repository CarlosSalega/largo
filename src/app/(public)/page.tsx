import type { Metadata } from "next";
import { Hero } from "@/features/homepage/components/Hero";
import { Benefits } from "@/features/homepage/components/Benefits";
import { FeaturedCategories } from "@/features/homepage/components/FeaturedCategories";
import { FeaturedProducts } from "@/features/homepage/components/FeaturedProducts";
import { FeaturedBrands } from "@/features/homepage/components/FeaturedBrands";
import {
  getFeaturedCategories,
  getFeaturedProducts,
  getActiveBrands,
} from "@/features/homepage/queries";

export const metadata: Metadata = {
  title: "Largo — Premium Tech Store",
  description:
    "Discover the latest technology from the world's leading brands. Premium smartphones, laptops, audio, and accessories — all in one place.",
  openGraph: {
    title: "Largo — Premium Tech Store",
    description:
      "Discover the latest technology from the world's leading brands.",
    type: "website",
    locale: "en_US",
  },
};

export default async function HomePage() {
  const [categories, products, brands] = await Promise.all([
    getFeaturedCategories(6),
    getFeaturedProducts(8),
    getActiveBrands(),
  ]);

  return (
    <>
      <Hero />
      <Benefits />
      <FeaturedCategories categories={categories} />
      <FeaturedProducts products={products} />
      <FeaturedBrands brands={brands} />
    </>
  );
}
