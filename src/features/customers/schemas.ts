// ---------------------------------------------------------------------------
// Customer Zod schemas — sign-in / sign-up / profile / password
// ---------------------------------------------------------------------------

import { z } from "zod";

const EMAIL_ERROR = "Ingresá un email válido";
const PASSWORD_ERROR = "La contraseña debe tener al menos 8 caracteres";

export const signInSchema = z.object({
  email: z.email({ error: EMAIL_ERROR }),
  password: z.string().min(8, { error: PASSWORD_ERROR }),
});

export const signUpSchema = signInSchema; // same fields as per design

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;

// ---- profile schemas --------------------------------------------------------

export const profileSchema = z.object({
  name: z.string().min(1, "Ingresá tu nombre"),
});

export const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Ingresá tu contraseña actual"),
  newPassword: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export type ProfileInput = z.infer<typeof profileSchema>;
export type PasswordInput = z.infer<typeof passwordSchema>;
