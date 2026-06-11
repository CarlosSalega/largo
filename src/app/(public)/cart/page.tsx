import type { Metadata } from "next";
import { CartPageContent } from "@/features/cart/components/CartPageContent";

export const metadata: Metadata = {
  title: "Carrito | Largo",
  description: "Revisá tu carrito antes de finalizar la compra.",
};

export default function CartPage() {
  return <CartPageContent />;
}
