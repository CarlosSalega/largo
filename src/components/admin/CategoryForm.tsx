"use client";

// ---------------------------------------------------------------------------
// CategoryForm — shared RHF + Zod form used by create and edit category pages
// Fields: name, description, featured, active, image (ImageUpload maxImages=1)
// ---------------------------------------------------------------------------

import { useForm } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "@/components/admin/ImageUpload";
import {
  categoryFormSchema,
  type CategoryFormInput,
} from "@/features/admin/schemas";

// ── Types ────────────────────────────────────────────────────────────────────

interface CategoryFormProps {
  /** Pre-filled values for edit mode */
  defaultValues?: Partial<CategoryFormInput> & { id?: string };
  /** Called with validated form data on submit */
  onSubmit: (data: CategoryFormInput) => Promise<void>;
  /** Button label (e.g. "Crear categoría", "Guardar cambios") */
  submitLabel: string;
  /** Whether the form submission is in progress */
  isPending?: boolean;
  /** Show active toggle (only on create) */
  showActiveToggle?: boolean;
  /** Existing image URL to display (edit mode) */
  existingImage?: string | null;
}

// ── Component ────────────────────────────────────────────────────────────────

export function CategoryForm({
  defaultValues,
  onSubmit,
  submitLabel,
  isPending = false,
  showActiveToggle = false,
  existingImage,
}: CategoryFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CategoryFormInput>({
    resolver: zodResolver(
      categoryFormSchema,
    ) as unknown as Resolver<CategoryFormInput>,
    defaultValues: {
      name: defaultValues?.name ?? "",
      description: defaultValues?.description ?? "",
      featured: defaultValues?.featured ?? false,
      active: defaultValues?.active ?? true,
      image: defaultValues?.image ?? "",
    },
  });

  const watchedFeatured = watch("featured");
  const watchedActive = watch("active");
  const watchedImage = watch("image");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      {/* ── Form grid ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column — main fields */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          {/* Name */}
          <div>
            <label
              htmlFor="category-name"
              className="mb-1 block text-sm font-medium text-card-foreground"
            >
              Nombre
            </label>
            <Input
              id="category-name"
              placeholder="Nombre de la categoría"
              {...register("name")}
            />
            <p className="min-h-[1.5rem] text-sm text-destructive">
              {errors.name?.message ?? "\u00A0"}
            </p>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="category-description"
              className="mb-1 block text-sm font-medium text-card-foreground"
            >
              Descripción
            </label>
            <Textarea
              id="category-description"
              placeholder="Descripción de la categoría (opcional)"
              rows={4}
              {...register("description")}
            />
            <p className="min-h-[1.5rem] text-sm text-destructive">
              {errors.description?.message ?? "\u00A0"}
            </p>
          </div>
        </div>

        {/* Right column — switches + image */}
        <div className="flex flex-col gap-6">
          {/* Switches card */}
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="mb-4 text-sm font-semibold text-card-foreground">
              Estado
            </h3>

            <div className="flex flex-col gap-4">
              {/* Featured */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-card-foreground">
                    Destacado
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Aparece en la sección destacada
                  </p>
                </div>
                <Switch
                  checked={watchedFeatured}
                  onCheckedChange={(checked) =>
                    setValue("featured", checked)
                  }
                />
              </div>

              {/* Active (create only) */}
              {showActiveToggle && (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-card-foreground">
                      Activo
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Visible en la tienda
                    </p>
                  </div>
                  <Switch
                    checked={watchedActive}
                    onCheckedChange={(checked) =>
                      setValue("active", checked)
                    }
                  />
                </div>
              )}
            </div>
          </div>

          {/* Image */}
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="mb-4 text-sm font-semibold text-card-foreground">
              Imagen
            </h3>

            {/* Show existing image in edit mode */}
            {existingImage && !watchedImage && (
              <div className="mb-4">
                <p className="mb-2 text-xs text-muted-foreground">
                  Imagen actual
                </p>
                <img
                  src={existingImage}
                  alt="Imagen actual de la categoría"
                  className="aspect-4/3 w-full rounded-lg border border-border object-cover"
                  loading="lazy"
                />
              </div>
            )}

            <ImageUpload
              value={watchedImage ? [watchedImage] : []}
              onChange={(value) =>
                setValue("image", value[0] ?? "")
              }
              maxImages={1}
            />
          </div>
        </div>
      </div>

      {/* Bottom actions */}
      <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="animate-spin" data-icon="inline-start" />
              Guardando...
            </>
          ) : (
            <>
              <Save data-icon="inline-start" />
              {submitLabel}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
