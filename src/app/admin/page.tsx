// ---------------------------------------------------------------------------
// Admin root — redirects to /admin/products
// ---------------------------------------------------------------------------

import { redirect } from "next/navigation";

export default function AdminPage() {
  redirect("/admin/products");
}
