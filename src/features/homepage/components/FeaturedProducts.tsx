import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice } from "@/lib/formatPrice";
import type { Product, ProductImage, Category } from "@/lib/db/types";

type FeaturedProduct = Product & {
  images: ProductImage[];
  category: Pick<Category, "name" | "slug">;
};

interface FeaturedProductsProps {
  products: FeaturedProduct[];
}

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  if (products.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Featured Products
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Hand-picked products we think you&apos;ll love. Quality and
            performance guaranteed.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <Link key={product.id} href={`/products/${product.slug}`}>
              <Card className="group h-full transition-shadow hover:shadow-md">
                <CardContent className="p-0">
                  <div className="aspect-square w-full overflow-hidden rounded-t-xl bg-muted">
                    {product.images[0] ? (
                      <img
                        src={product.images[0].url}
                        alt={product.images[0].alt ?? product.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                        <span className="text-lg font-semibold text-muted-foreground/30">
                          {product.name}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {product.category.name}
                    </p>
                    <h3 className="mt-1 font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    <p className="mt-2 text-lg font-bold text-foreground">
                      {formatPrice(product.price, product.currency)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
