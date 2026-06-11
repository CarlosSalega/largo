import Link from "next/link";
import type { Brand } from "@/lib/db/types";

interface FeaturedBrandsProps {
  brands: Brand[];
}

export function FeaturedBrands({ brands }: FeaturedBrandsProps) {
  if (brands.length === 0) return null;

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Las mejores marcas
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Trabajamos con las marcas de tecnología más confiables del mundo para
            traerte los mejores productos.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              href={`/catalog?brand=${brand.slug}`}
              className="group flex items-center gap-3 text-muted-foreground transition-colors hover:text-foreground"
            >
              {brand.logo ? (
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="h-8 w-auto opacity-60 transition-opacity group-hover:opacity-100"
                />
              ) : (
                <span className="text-xl font-bold tracking-tight">
                  {brand.name}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
