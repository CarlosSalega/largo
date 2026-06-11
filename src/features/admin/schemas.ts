// ---------------------------------------------------------------------------
// Admin Zod schemas — product form, category form, order filter
// Zod 4 patterns: use { error } instead of { message }, top-level z.email() etc.
// ---------------------------------------------------------------------------

import { z } from "zod";

// ── Product form schema ──────────────────────────────────────────────────────

export const productFormSchema = z.object({
  name: z.string().min(1, { error: "Ingresá el nombre del producto" }),
  description: z.string().min(1, { error: "Ingresá la descripción" }),
  price: z.coerce
    .number({ error: "Ingresá un precio válido" })
    .positive({ error: "El precio debe ser mayor a 0" }),
  currency: z.enum(["USD", "ARS"]).default("USD"),
  stock: z.coerce
    .number({ error: "Ingresá un stock válido" })
    .int({ error: "El stock debe ser un número entero" })
    .min(0, { error: "El stock no puede ser negativo" }),
  brandId: z.string().min(1, { error: "Seleccioná una marca" }),
  categoryId: z.string().min(1, { error: "Seleccioná una categoría" }),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
  images: z.array(z.string()).default([]),
});

export type ProductFormInput = z.infer<typeof productFormSchema>;

// ── Category form schema ─────────────────────────────────────────────────────

export const categoryFormSchema = z.object({
  name: z.string().min(1, { error: "Ingresá el nombre de la categoría" }),
  description: z.string().optional().default(""),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
  image: z.string().optional().default(""),
});

export type CategoryFormInput = z.infer<typeof categoryFormSchema>;

// ── Order filter schema ──────────────────────────────────────────────────────

export const orderFilterSchema = z.object({
  status: z
    .enum(["PENDING", "PAID", "CANCELLED", "REFUNDED"])
    .optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
});

export type OrderFilterInput = z.infer<typeof orderFilterSchema>;
