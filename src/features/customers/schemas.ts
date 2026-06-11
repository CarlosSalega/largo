// ---------------------------------------------------------------------------
// Customer auth Zod schemas — sign-in / sign-up validation
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
