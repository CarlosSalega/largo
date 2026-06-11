"use client";

// ---------------------------------------------------------------------------
// New category page — /admin/categories/new
// Client component wrapping CategoryForm. Calls createCategory action.
// ---------------------------------------------------------------------------

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { createCategory } from "@/features/admin/actions";
import type { CategoryFormInput } from "@/features/admin/schemas";

// ── Page ─────────────────────────────────────────────────────────────────────

export default function NewCategoryPage() {
  const router = useRouter();

  async function handleSubmit(data: CategoryFormInput) {
    const result = await createCategory(data);

    if ("error" in result) {
      toast.error(result.error);
    } else {
      toast.success("Categoría creada");
      router.push("/admin/categories");
      router.refresh();
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ─────────────────────────────────────────────────────── */}
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
          Nueva categoría
        </h1>
      </div>

      {/* ── Form ───────────────────────────────────────────────────────── */}
      <CategoryForm
        submitLabel="Crear categoría"
        onSubmit={handleSubmit}
        showActiveToggle
      />
    </div>
  );
}
