// ---------------------------------------------------------------------------
// Checkout Zod schemas — validation for multi-step checkout form
// ---------------------------------------------------------------------------

import { z } from "zod";

// ---- Customer step --------------------------------------------------------

export const customerSchema = z.object({
  name: z.string({ error: "El nombre es obligatorio" }).min(1, {
    error: "El nombre es obligatorio",
  }),
  email: z.email({ error: "Formato de email inválido" }),
  phone: z.string().optional(),
});

// ---- Shipping step --------------------------------------------------------

export const shippingSchema = z.object({
  street: z.string({ error: "La dirección es obligatoria" }).min(1, {
    error: "La dirección es obligatoria",
  }),
  city: z.string({ error: "La ciudad es obligatoria" }).min(1, {
    error: "La ciudad es obligatoria",
  }),
  state: z.string({ error: "La provincia es obligatoria" }).min(1, {
    error: "La provincia es obligatoria",
  }),
  zipCode: z.string({ error: "El código postal es obligatorio" }).min(1, {
    error: "El código postal es obligatorio",
  }),
  country: z.string().default("Argentina"),
});

// ---- Combined checkout schema ---------------------------------------------

export const checkoutSchema = customerSchema.merge(shippingSchema);

export type CustomerInput = z.infer<typeof customerSchema>;
export type ShippingInput = z.infer<typeof shippingSchema>;
