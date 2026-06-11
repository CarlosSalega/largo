// ---------------------------------------------------------------------------
// Edit product page — /admin/products/[id]/edit
// Fetches product data server-side, renders pre-filled ProductForm.
// ---------------------------------------------------------------------------

import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { ProductForm } from "@/components/admin/ProductForm";
import {
  getAdminProductById,
  getAdminCategories,
  getAdminBrands,
} from "@/features/admin/queries";
import { priceAsString } from "@/lib/formatPrice";

export const metadata: Metadata = {
  title: "Editar producto | Admin | Largo",
  robots: { index: false, follow: false },
};

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [product, categories, brands] = await Promise.all([
    getAdminProductById(id),
    getAdminCategories(),
    getAdminBrands(),
  ]);

  if (!product) {
    notFound();
  }

  // Convert Decimal price to number for the form
  const defaultValues = {
    id: product.id,
    name: product.name,
    description: product.description,
    price: parseFloat(priceAsString(product.price)),
    currency: product.currency as "USD" | "ARS",
    stock: product.stock,
    brandId: product.brandId,
    categoryId: product.categoryId,
    featured: product.featured,
    active: product.active,
    images: product.images.map((img) => img.publicId ?? img.url),
  };

  return (
    <ProductForm
      mode="edit"
      defaultValues={defaultValues}
      categories={categories}
      brands={brands}
    />
  );
}
