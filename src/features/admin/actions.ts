"use server";

// ---------------------------------------------------------------------------
// Admin Server Actions — product CRUD, image management, brand inline creation
// All guarded by requireAdmin(). { success | error } return pattern.
// ---------------------------------------------------------------------------

import { revalidatePath } from "next/cache";
import slugifyLib from "slugify";

import db from "@/lib/db/client";
import { requireAdmin } from "@/lib/auth/utils";
import { cloudinary } from "@/lib/cloudinary/config";
import { productFormSchema, categoryFormSchema } from "@/features/admin/schemas";
import type { ProductFormInput, CategoryFormInput } from "@/features/admin/schemas";
import type { Prisma } from "@prisma/client";

// ── Slug Helpers ─────────────────────────────────────────────────────────────

function generateSlug(name: string): string {
  return slugifyLib(name, { lower: true, strict: true, trim: true });
}

/**
 * Generate a unique slug for a product.
 * If the base slug exists, append a numeric suffix (-1, -2, …).
 * @param name     Product name
 * @param excludeId  Optional product ID to exclude from uniqueness check (for updates)
 */
async function uniqueProductSlug(
  name: string,
  excludeId?: string,
): Promise<string> {
  const base = generateSlug(name);

  const existing = await db.product.findFirst({
    where: {
      slug: base,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { id: true },
  });

  if (!existing) return base;

  // Find the next available suffix
  let suffix = 1;
  let candidate = `${base}-${suffix}`;
  while (
    await db.product.findFirst({
      where: {
        slug: candidate,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true },
    })
  ) {
    suffix++;
    candidate = `${base}-${suffix}`;
  }

  return candidate;
}

/**
 * Generate a unique slug for a brand.
 */
async function uniqueBrandSlug(name: string): Promise<string> {
  const base = generateSlug(name);

  const existing = await db.brand.findUnique({
    where: { slug: base },
    select: { id: true },
  });

  if (!existing) return base;

  let suffix = 1;
  let candidate = `${base}-${suffix}`;
  while (
    await db.brand.findUnique({
      where: { slug: candidate },
      select: { id: true },
    })
  ) {
    suffix++;
    candidate = `${base}-${suffix}`;
  }

  return candidate;
}

/**
 * Generate a unique slug for a category.
 */
async function uniqueCategorySlug(
  name: string,
  excludeId?: string,
): Promise<string> {
  const base = generateSlug(name);

  const existing = await db.category.findFirst({
    where: {
      slug: base,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { id: true },
  });

  if (!existing) return base;

  let suffix = 1;
  let candidate = `${base}-${suffix}`;
  while (
    await db.category.findFirst({
      where: {
        slug: candidate,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true },
    })
  ) {
    suffix++;
    candidate = `${base}-${suffix}`;
  }

  return candidate;
}

// ── Product Actions ──────────────────────────────────────────────────────────

export async function createProduct(
  data: ProductFormInput,
): Promise<{ success: true; productId: string } | { error: string }> {
  try {
    await requireAdmin();

    const parsed = productFormSchema.safeParse(data);
    if (!parsed.success) {
      return { error: "Datos inválidos. Revisá el formulario." };
    }

    const { images, ...productData } = parsed.data;
    const slug = await uniqueProductSlug(productData.name);

    const product = await db.$transaction(async (tx: Prisma.TransactionClient) => {
      const created = await tx.product.create({
        data: {
          ...productData,
          slug,
        },
      });

      // Create ProductImage records for each uploaded image
      if (images.length > 0) {
        await tx.productImage.createMany({
          data: images.map((publicId, index) => ({
            url: publicId,
            publicId,
            alt: `${productData.name} - imagen ${index + 1}`,
            order: index,
            productId: created.id,
          })),
        });
      }

      return created;
    });

    revalidatePath("/admin/products");

    return { success: true, productId: product.id };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message.toLowerCase() : String(err);

    if (message.includes("unique") || message.includes("duplicate")) {
      return { error: "Ya existe un producto con ese nombre o slug." };
    }

    return { error: "Error al crear el producto. Intentá de nuevo." };
  }
}

export async function updateProduct(
  id: string,
  data: ProductFormInput,
): Promise<{ success: true } | { error: string }> {
  try {
    await requireAdmin();

    const parsed = productFormSchema.safeParse(data);
    if (!parsed.success) {
      return { error: "Datos inválidos. Revisá el formulario." };
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { images: _images, ...productData } = parsed.data;

    // Check if product exists
    const existing = await db.product.findUnique({
      where: { id },
      select: { id: true, name: true },
    });

    if (!existing) {
      return { error: "Producto no encontrado." };
    }

    // Regenerate slug only if name changed
    const slug =
      existing.name !== productData.name
        ? await uniqueProductSlug(productData.name, id)
        : undefined;

    await db.product.update({
      where: { id },
      data: {
        ...productData,
        ...(slug ? { slug } : {}),
      },
    });

    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${id}/edit`);

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message.toLowerCase() : String(err);

    if (message.includes("not found")) {
      return { error: "Producto no encontrado." };
    }

    return { error: "Error al actualizar el producto. Intentá de nuevo." };
  }
}

export async function archiveProduct(
  id: string,
): Promise<{ success: true } | { error: string }> {
  try {
    await requireAdmin();

    await db.product.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        active: false,
      },
    });

    revalidatePath("/admin/products");

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message.toLowerCase() : String(err);

    if (message.includes("not found")) {
      return { error: "Producto no encontrado." };
    }

    return { error: "Error al archivar el producto. Intentá de nuevo." };
  }
}

export async function toggleProductFeatured(
  id: string,
  featured: boolean,
): Promise<{ success: true } | { error: string }> {
  try {
    await requireAdmin();

    await db.product.update({
      where: { id },
      data: { featured },
    });

    revalidatePath("/admin/products");

    return { success: true };
  } catch {
    return { error: "Error al actualizar el producto." };
  }
}

export async function toggleProductActive(
  id: string,
  active: boolean,
): Promise<{ success: true } | { error: string }> {
  try {
    await requireAdmin();

    await db.product.update({
      where: { id },
      data: { active },
    });

    revalidatePath("/admin/products");

    return { success: true };
  } catch {
    return { error: "Error al actualizar el producto." };
  }
}

export async function updateProductStock(
  id: string,
  stock: number,
): Promise<{ success: true } | { error: string }> {
  try {
    await requireAdmin();

    if (!Number.isInteger(stock) || stock < 0) {
      return { error: "El stock debe ser un número entero mayor o igual a 0." };
    }

    await db.product.update({
      where: { id },
      data: { stock },
    });

    revalidatePath("/admin/products");

    return { success: true };
  } catch {
    return { error: "Error al actualizar el stock." };
  }
}

// ── Product Image Actions ────────────────────────────────────────────────────

export async function addProductImage(
  productId: string,
  imageKey: string,
  imageUrl: string,
  alt?: string,
): Promise<{ success: true } | { error: string }> {
  try {
    await requireAdmin();

    // Determine next order value
    const lastImage = await db.productImage.findFirst({
      where: { productId },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const nextOrder = (lastImage?.order ?? -1) + 1;

    await db.productImage.create({
      data: {
        url: imageUrl,
        publicId: imageKey,
        alt: alt ?? null,
        order: nextOrder,
        productId,
      },
    });

    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${productId}/edit`);

    return { success: true };
  } catch {
    return { error: "Error al agregar la imagen." };
  }
}

export async function removeProductImage(
  imageId: string,
): Promise<{ success: true } | { error: string }> {
  try {
    await requireAdmin();

    const image = await db.productImage.findUnique({
      where: { id: imageId },
      select: { id: true, publicId: true, productId: true },
    });

    if (!image) {
      return { error: "Imagen no encontrada." };
    }

    // Delete from Cloudinary
    if (image.publicId) {
      try {
        await cloudinary.uploader.destroy(image.publicId);
      } catch {
        // Cloudinary deletion is best-effort — don't block DB cleanup
      }
    }

    // Delete DB record
    await db.productImage.delete({ where: { id: imageId } });

    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${image.productId}/edit`);

    return { success: true };
  } catch {
    return { error: "Error al eliminar la imagen." };
  }
}

export async function reorderProductImages(
  productId: string,
  imageIds: string[],
): Promise<{ success: true } | { error: string }> {
  try {
    await requireAdmin();

    // Update order for each image based on position in array
    await db.$transaction(
      imageIds.map((id, index) =>
        db.productImage.update({
          where: { id },
          data: { order: index },
        }),
      ),
    );

    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${productId}/edit`);

    return { success: true };
  } catch {
    return { error: "Error al reordenar las imágenes." };
  }
}

// ── Brand Inline Creation ────────────────────────────────────────────────────

export async function createBrandInline(
  name: string,
): Promise<
  | { success: true; brandId: string; brand: { id: string; name: string } }
  | { error: string }
> {
  try {
    await requireAdmin();

    const trimmed = name.trim();
    if (trimmed.length === 0) {
      return { error: "Ingresá el nombre de la marca." };
    }

    const slug = await uniqueBrandSlug(trimmed);

    const brand = await db.brand.create({
      data: { name: trimmed, slug },
      select: { id: true, name: true },
    });

    revalidatePath("/admin/products");

    return { success: true, brandId: brand.id, brand };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message.toLowerCase() : String(err);

    if (message.includes("unique") || message.includes("duplicate")) {
      return { error: "Ya existe una marca con ese nombre." };
    }

    return { error: "Error al crear la marca. Intentá de nuevo." };
  }
}

// ── Category Actions ─────────────────────────────────────────────────────────

export async function createCategory(
  data: CategoryFormInput,
): Promise<{ success: true; categoryId: string } | { error: string }> {
  try {
    await requireAdmin();

    const parsed = categoryFormSchema.safeParse(data);
    if (!parsed.success) {
      return { error: "Datos inválidos. Revisá el formulario." };
    }

    const { image, ...categoryData } = parsed.data;
    const slug = await uniqueCategorySlug(categoryData.name);

    const category = await db.category.create({
      data: {
        ...categoryData,
        slug,
        ...(image ? { image } : {}),
      },
    });

    revalidatePath("/admin/categories");

    return { success: true, categoryId: category.id };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message.toLowerCase() : String(err);

    if (message.includes("unique") || message.includes("duplicate")) {
      return { error: "Ya existe una categoría con ese nombre." };
    }

    return { error: "Error al crear la categoría. Intentá de nuevo." };
  }
}

export async function updateCategory(
  id: string,
  data: CategoryFormInput,
): Promise<{ success: true } | { error: string }> {
  try {
    await requireAdmin();

    const parsed = categoryFormSchema.safeParse(data);
    if (!parsed.success) {
      return { error: "Datos inválidos. Revisá el formulario." };
    }

    const { image, ...categoryData } = parsed.data;

    // Check if category exists
    const existing = await db.category.findUnique({
      where: { id },
      select: { id: true, name: true },
    });

    if (!existing) {
      return { error: "Categoría no encontrada." };
    }

    // Regenerate slug only if name changed
    const slug =
      existing.name !== categoryData.name
        ? await uniqueCategorySlug(categoryData.name, id)
        : undefined;

    await db.category.update({
      where: { id },
      data: {
        ...categoryData,
        ...(slug ? { slug } : {}),
        ...(image !== undefined ? { image: image || null } : {}),
      },
    });

    revalidatePath("/admin/categories");
    revalidatePath(`/admin/categories/${id}/edit`);

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message.toLowerCase() : String(err);

    if (message.includes("not found")) {
      return { error: "Categoría no encontrada." };
    }

    return { error: "Error al actualizar la categoría. Intentá de nuevo." };
  }
}

export async function archiveCategory(
  id: string,
): Promise<{ success: true } | { error: string }> {
  try {
    await requireAdmin();

    await db.category.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        active: false,
      },
    });

    revalidatePath("/admin/categories");

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message.toLowerCase() : String(err);

    if (message.includes("not found")) {
      return { error: "Categoría no encontrada." };
    }

    return { error: "Error al archivar la categoría. Intentá de nuevo." };
  }
}

export async function toggleCategoryFeatured(
  id: string,
  featured: boolean,
): Promise<{ success: true } | { error: string }> {
  try {
    await requireAdmin();

    await db.category.update({
      where: { id },
      data: { featured },
    });

    revalidatePath("/admin/categories");

    return { success: true };
  } catch {
    return { error: "Error al actualizar la categoría." };
  }
}

export async function addCategoryImage(
  categoryId: string,
  imageKey: string,
  imageUrl: string,
): Promise<{ success: true } | { error: string }> {
  try {
    await requireAdmin();

    await db.category.update({
      where: { id: categoryId },
      data: { image: imageUrl },
    });

    revalidatePath("/admin/categories");
    revalidatePath(`/admin/categories/${categoryId}/edit`);

    return { success: true };
  } catch {
    return { error: "Error al agregar la imagen." };
  }
}

export async function removeCategoryImage(
  categoryId: string,
): Promise<{ success: true } | { error: string }> {
  try {
    await requireAdmin();

    const category = await db.category.findUnique({
      where: { id: categoryId },
      select: { image: true },
    });

    if (!category) {
      return { error: "Categoría no encontrada." };
    }

    // Delete from Cloudinary if image exists (best-effort)
    if (category.image) {
      try {
        // Extract publicId from Cloudinary URL
        // Format: https://res.cloudinary.com/{cloud}/image/upload/{transforms}/{publicId}.{ext}
        const urlParts = category.image.split("/");
        const lastPart = urlParts[urlParts.length - 1] ?? "";
        const publicId = lastPart.replace(/\.(webp|jpg|jpeg|png|gif)$/i, "");
        const uploadIndex = urlParts.indexOf("upload");
        if (uploadIndex > -1 && uploadIndex < urlParts.length - 1) {
          // Public ID includes folder path after "upload" minus the filename
          const folderParts = urlParts.slice(uploadIndex + 1);
          const fullPublicId = folderParts.join("/").replace(/\.(webp|jpg|jpeg|png|gif)$/i, "");
          await cloudinary.uploader.destroy(fullPublicId);
        } else {
          await cloudinary.uploader.destroy(publicId);
        }
      } catch {
        // Cloudinary deletion is best-effort — don't block DB cleanup
      }
    }

    await db.category.update({
      where: { id: categoryId },
      data: { image: null },
    });

    revalidatePath("/admin/categories");
    revalidatePath(`/admin/categories/${categoryId}/edit`);

    return { success: true };
  } catch {
    return { error: "Error al eliminar la imagen." };
  }
}
