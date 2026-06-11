import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice } from "@/lib/formatPrice";
import type { Product, ProductImage, Category, Brand } from "@/lib/db/types";

export type ProductCardProduct = Product & {
  images: ProductImage[];
  category: Pick<Category, "name" | "slug">;
  brand: Pick<Brand, "name" | "slug">;
};

interface ProductCardProps {
  product: ProductCardProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const inStock = product.stock > 0;

  return (
    <Link href={`/products/${product.slug}`}>
      <Card className="group h-full transition-shadow hover:shadow-md">
        <CardContent className="p-0 flex flex-col h-full">
          {/* Image */}
          <div className="aspect-square w-full overflow-hidden rounded-t-xl bg-muted relative">
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
            {/* Stock badge */}
            {!inStock && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[2px]">
                <span className="rounded-full bg-destructive/90 px-3 py-1 text-xs font-semibold text-white">
                  Out of stock
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-4 flex flex-col flex-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {product.category.name}
            </p>
            <h3 className="mt-1 font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            <div className="mt-auto pt-2 flex items-center justify-between">
              <p className="text-lg font-bold text-foreground">
                {formatPrice(product.price, product.currency)}
              </p>
              {inStock && (
                <span className="text-xs font-medium text-emerald-600">
                  In stock
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
