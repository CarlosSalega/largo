import type { Product, Category, Brand } from "@/lib/db/types";
import { formatPrice } from "@/features/product-detail/queries";

interface ProductInfoProps {
  product: Product & {
    category: Pick<Category, "name" | "slug">;
    brand: Pick<Brand, "name" | "slug">;
  };
}

export function ProductInfo({ product }: ProductInfoProps) {
  return (
    <div className="space-y-6">
      {/* Brand + Category line */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {product.brand.name}
        </span>
        <span className="text-muted-foreground/40 select-none" aria-hidden="true">
          ·
        </span>
        <span className="text-xs font-medium text-muted-foreground">
          {product.category.name}
        </span>
      </div>

      {/* Product name */}
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        {product.name}
      </h1>

      {/* Price */}
      <p className="text-3xl font-bold text-foreground">
        {formatPrice(product.price)}
      </p>

      {/* Description */}
      <div className="text-sm leading-relaxed text-muted-foreground">
        <p>{product.description}</p>
      </div>
    </div>
  );
}
