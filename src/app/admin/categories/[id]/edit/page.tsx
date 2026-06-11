// ---------------------------------------------------------------------------
// Edit category page — /admin/categories/[id]/edit
// Server Component — fetches category data, renders pre-filled CategoryForm.
// ---------------------------------------------------------------------------

import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { EditCategoryForm } from "./client";

export const metadata: Metadata = {
  title: "Editar categoría | Admin | Largo",
  robots: { index: false, follow: false },
};

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Dynamic import to keep this file a server component
  const { getAdminCategoryById } = await import(
    "@/features/admin/queries"
  );

  const { id } = await params;

  const category = await getAdminCategoryById(id);

  if (!category) {
    notFound();
  }

  const defaultValues = {
    name: category.name,
    description: category.description ?? "",
    featured: category.featured,
    active: category.active,
    image: category.image ?? "",
  };

  return (
    <EditCategoryForm
      categoryId={category.id}
      defaultValues={defaultValues}
      existingImage={category.image}
    />
  );
}
