import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getProductBySlug,
  getAllProductSlugs,
  getRelatedProducts,
  priceAsString,
} from "@/features/product-detail/queries";
import { toNumber } from "@/lib/formatPrice";
import { ProductGallery } from "@/features/product-detail/components/ProductGallery";
import { ProductInfo } from "@/features/product-detail/components/ProductInfo";
import { ProductStock } from "@/features/product-detail/components/ProductStock";
import { RelatedProducts } from "@/features/product-detail/components/RelatedProducts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

// ---------------------------------------------------------------------------
// SSG — pre-render all active product pages at build time
// ---------------------------------------------------------------------------

export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

// ---------------------------------------------------------------------------
// Dynamic metadata (task 4.7)
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "Product not found" };
  }

  const description = product.description.slice(0, 160);
  const imageUrl = product.images[0]?.url;

  return {
    title: product.name,
    description: description || product.name,
    openGraph: {
      title: product.name,
      description: description || product.name,
      type: "website",
      locale: "en_US",
      ...(imageUrl && {
        images: [{ url: imageUrl, alt: product.name }],
      }),
    },
  };
}

// ---------------------------------------------------------------------------
// Page (task 4.6)
// ---------------------------------------------------------------------------

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(slug, product.categoryId);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((img) => img.url),
    brand: {
      "@type": "Brand",
      name: product.brand.name,
    },
    offers: {
      "@type": "Offer",
      price: priceAsString(product.price),
      priceCurrency: product.currency,
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };

  return (
    <>
      {/* JSON-LD structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Product detail section */}
      <div className="section-padding">
        <div className="section-container">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
            {/* Gallery column */}
            <ProductGallery
              images={product.images}
              productName={product.name}
            />

            {/* Info + stock column */}
            <div className="flex flex-col gap-8">
              <ProductInfo product={product} />
              <ProductStock
                stock={product.stock}
                productId={product.id}
                slug={product.slug}
                name={product.name}
                price={toNumber(product.price)}
                currency={product.currency}
                image={product.images[0]?.url ?? null}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Related products section */}
      <RelatedProducts products={relatedProducts} />
    </>
  );
}
