"use client";

// ---------------------------------------------------------------------------
// ProductForm — shared RHF + Zod form used by create and edit product pages
// Fields: name, description, price, currency, stock, categoryId, brandId,
//         featured, active, images (ImageUpload)
// ---------------------------------------------------------------------------

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Loader2,
  Save,
  ArrowLeft,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { BrandCombobox } from "@/components/admin/BrandCombobox";
import {
  productFormSchema,
  type ProductFormInput,
} from "@/features/admin/schemas";
import { createProduct, updateProduct } from "@/features/admin/actions";

// ── Types ────────────────────────────────────────────────────────────────────

interface CategoryOption {
  id: string;
  name: string;
}

interface BrandOption {
  id: string;
  name: string;
}

interface ProductFormProps {
  mode: "create" | "edit";
  /** Pre-filled values for edit mode */
  defaultValues?: Partial<ProductFormInput> & { id?: string };
  categories: CategoryOption[];
  brands: BrandOption[];
}

// ── Component ────────────────────────────────────────────────────────────────

export function ProductForm({
  mode,
  defaultValues,
  categories,
  brands,
}: ProductFormProps) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormInput>({
    resolver: zodResolver(productFormSchema) as unknown as Resolver<ProductFormInput>,
    defaultValues: {
      name: "",
      description: "",
      price: undefined as unknown as number,
      currency: "USD",
      stock: 0,
      brandId: "",
      categoryId: "",
      featured: false,
      active: true,
      images: [],
      ...defaultValues,
    },
  });

  // Pre-fill form if defaultValues change (edit mode)
  useEffect(() => {
    if (mode === "edit" && defaultValues) {
      reset({
        name: defaultValues.name ?? "",
        description: defaultValues.description ?? "",
        price: defaultValues.price,
        currency: defaultValues.currency ?? "USD",
        stock: defaultValues.stock ?? 0,
        brandId: defaultValues.brandId ?? "",
        categoryId: defaultValues.categoryId ?? "",
        featured: defaultValues.featured ?? false,
        active: defaultValues.active ?? true,
        images: defaultValues.images ?? [],
      });
    }
  }, [mode, defaultValues, reset]);

  const watchedCurrency = watch("currency");
  const watchedBrandId = watch("brandId");
  const watchedCategoryId = watch("categoryId");
  const watchedFeatured = watch("featured");
  const watchedActive = watch("active");
  const watchedImages = watch("images");

  async function onSubmit(data: ProductFormInput) {
    try {
      const result =
        mode === "create"
          ? await createProduct(data)
          : await updateProduct(defaultValues?.id ?? "", data);

      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success(
          mode === "create"
            ? "Producto creado"
            : "Producto actualizado",
        );
        router.push("/admin/products");
        router.refresh();
      }
    } catch {
      toast.error("Error de conexión. Intentá de nuevo.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => router.push("/admin/products")}
          >
            <ArrowLeft className="size-5" />
          </Button>
          <h1 className="text-2xl font-bold text-card-foreground">
            {mode === "create" ? "Nuevo producto" : "Editar producto"}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/products")}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" data-icon="inline-start" />
                Guardando...
              </>
            ) : (
              <>
                <Save data-icon="inline-start" />
                Guardar
              </>
            )}
          </Button>
        </div>
      </div>

      {/* ── Form grid ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column — main fields */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          {/* Name */}
          <div>
            <label
              htmlFor="product-name"
              className="mb-1 block text-sm font-medium text-card-foreground"
            >
              Nombre
            </label>
            <Input
              id="product-name"
              placeholder="Nombre del producto"
              {...register("name")}
            />
            <p className="min-h-[1.5rem] text-sm text-destructive">
              {errors.name?.message ?? "\u00A0"}
            </p>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="product-description"
              className="mb-1 block text-sm font-medium text-card-foreground"
            >
              Descripción
            </label>
            <Textarea
              id="product-description"
              placeholder="Descripción del producto"
              rows={4}
              {...register("description")}
            />
            <p className="min-h-[1.5rem] text-sm text-destructive">
              {errors.description?.message ?? "\u00A0"}
            </p>
          </div>

          {/* Price + Currency */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="product-price"
                className="mb-1 block text-sm font-medium text-card-foreground"
              >
                Precio
              </label>
              <Input
                id="product-price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                {...register("price")}
              />
              <p className="min-h-[1.5rem] text-sm text-destructive">
                {errors.price?.message ?? "\u00A0"}
              </p>
            </div>

            <div>
              <label
                htmlFor="product-currency"
                className="mb-1 block text-sm font-medium text-card-foreground"
              >
                Moneda
              </label>
              <Select
                value={watchedCurrency}
                onValueChange={(v) =>
                  setValue("currency", v as "USD" | "ARS")
                }
              >
                <SelectTrigger id="product-currency">
                  <SelectValue placeholder="Moneda" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="ARS">ARS</SelectItem>
                </SelectContent>
              </Select>
              <p className="min-h-[1.5rem] text-sm text-destructive">
                {errors.currency?.message ?? "\u00A0"}
              </p>
            </div>
          </div>

          {/* Stock */}
          <div>
            <label
              htmlFor="product-stock"
              className="mb-1 block text-sm font-medium text-card-foreground"
            >
              Stock
            </label>
            <Input
              id="product-stock"
              type="number"
              step="1"
              min="0"
              placeholder="0"
              {...register("stock")}
            />
            <p className="min-h-[1.5rem] text-sm text-destructive">
              {errors.stock?.message ?? "\u00A0"}
            </p>
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="product-category"
              className="mb-1 block text-sm font-medium text-card-foreground"
            >
              Categoría
            </label>
            <Select
              value={watchedCategoryId || undefined}
              onValueChange={(v) => setValue("categoryId", v)}
            >
              <SelectTrigger id="product-category">
                <SelectValue placeholder="Seleccionar categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="min-h-[1.5rem] text-sm text-destructive">
              {errors.categoryId?.message ?? "\u00A0"}
            </p>
          </div>

          {/* Brand */}
          <div>
            <label className="mb-1 block text-sm font-medium text-card-foreground">
              Marca
            </label>
            <BrandCombobox
              value={watchedBrandId || undefined}
              onChange={(id) => setValue("brandId", id)}
              brands={brands}
            />
            <p className="min-h-[1.5rem] text-sm text-destructive">
              {errors.brandId?.message ?? "\u00A0"}
            </p>
          </div>
        </div>

        {/* Right column — switches + images */}
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

              {/* Active */}
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
            </div>
          </div>

          {/* Images */}
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="mb-4 text-sm font-semibold text-card-foreground">
              Imágenes
            </h3>
            <ImageUpload
              value={watchedImages ?? []}
              onChange={(value) => setValue("images", value)}
              maxImages={10}
            />
          </div>
        </div>
      </div>

      {/* Bottom actions */}
      <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/products")}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" data-icon="inline-start" />
              Guardando...
            </>
          ) : (
            <>
              <Save data-icon="inline-start" />
              Guardar
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
