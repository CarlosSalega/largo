"use client";

// ---------------------------------------------------------------------------
// EditCategoryForm — client component wrapping CategoryForm for edit mode
// Handles server action calls, toasts, navigation, and archive confirmation.
// ---------------------------------------------------------------------------

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { CategoryForm } from "@/components/admin/CategoryForm";
import {
  updateCategory,
  archiveCategory,
} from "@/features/admin/actions";
import type { CategoryFormInput } from "@/features/admin/schemas";

// ── Types ────────────────────────────────────────────────────────────────────

interface EditCategoryFormProps {
  categoryId: string;
  defaultValues: {
    name: string;
    description: string;
    featured: boolean;
    active: boolean;
    image: string;
  };
  existingImage: string | null;
}

// ── Component ────────────────────────────────────────────────────────────────

export function EditCategoryForm({
  categoryId,
  defaultValues,
  existingImage,
}: EditCategoryFormProps) {
  const router = useRouter();

  async function handleSubmit(data: CategoryFormInput) {
    const result = await updateCategory(categoryId, data);

    if ("error" in result) {
      toast.error(result.error);
    } else {
      toast.success("Categoría actualizada");
      router.push("/admin/categories");
      router.refresh();
    }
  }

  async function handleArchive() {
    if (
      !confirm(
        "¿Archivar esta categoría? No se mostrará en la tienda.",
      )
    )
      return;

    const result = await archiveCategory(categoryId);

    if ("error" in result) {
      toast.error(result.error);
    } else {
      toast.success("Categoría archivada");
      router.push("/admin/categories");
      router.refresh();
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => router.push("/admin/categories")}
          >
            <ArrowLeft className="size-5" />
          </Button>
          <h1 className="text-2xl font-bold text-card-foreground">
            Editar categoría
          </h1>
        </div>
        <Button
          type="button"
          variant="outline"
          className="text-muted-foreground hover:text-destructive"
          onClick={handleArchive}
        >
          Archivar
        </Button>
      </div>

      {/* ── Form ───────────────────────────────────────────────────────── */}
      <CategoryForm
        defaultValues={defaultValues}
        submitLabel="Guardar cambios"
        onSubmit={handleSubmit}
        existingImage={existingImage}
      />
    </div>
  );
}
