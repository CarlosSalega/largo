import { ProductCard } from "@/features/catalog/components/ProductCard";
import type { ProductCardProduct } from "@/features/catalog/components/ProductCard";

interface RelatedProductsProps {
  products: ProductCardProduct[];
}

export function RelatedProducts({ products }: RelatedProductsProps) {
  if (products.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="section-container">
        <div className="mb-10">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Related products
          </h2>
          <p className="mt-2 text-muted-foreground">
            You might also like these
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
