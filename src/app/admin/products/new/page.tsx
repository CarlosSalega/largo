// ---------------------------------------------------------------------------
// New product page — /admin/products/new
// Client form with ImageUpload + BrandCombobox. Calls createProduct action.
// ---------------------------------------------------------------------------

import type { Metadata } from "next";

import { ProductForm } from "@/components/admin/ProductForm";
import { getAdminCategories, getAdminBrands } from "@/features/admin/queries";

export const metadata: Metadata = {
  title: "Nuevo producto | Admin | Largo",
  robots: { index: false, follow: false },
};

export default async function NewProductPage() {
  const [categories, brands] = await Promise.all([
    getAdminCategories(),
    getAdminBrands(),
  ]);

  return (
    <ProductForm
      mode="create"
      categories={categories}
      brands={brands}
    />
  );
}
