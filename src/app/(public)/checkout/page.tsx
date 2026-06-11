import type { Metadata } from "next";
import { CheckoutPageContent } from "@/features/checkout/components/CheckoutPageContent";

export const metadata: Metadata = {
  title: "Finalizar compra | Largo",
  description: "Completá tus datos para confirmar el pedido.",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return <CheckoutPageContent />;
}
