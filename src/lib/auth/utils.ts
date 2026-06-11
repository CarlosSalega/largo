// ---------------------------------------------------------------------------
// Auth utilities — requireAdmin() guard for Server Components & Server Actions
// ---------------------------------------------------------------------------

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";

export async function requireAdmin(): Promise<{
  id: string;
  name: string;
}> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "ADMIN") {
    redirect("/ingresar");
  }

  return { id: session.user.id, name: session.user.name };
}
