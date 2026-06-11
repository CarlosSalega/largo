import type { Metadata } from "next";
import { CartPageContent } from "@/features/cart/components/CartPageContent";

export const metadata: Metadata = {
  title: "Cart",
  description: "Review your shopping cart before checkout.",
};

export default function CartPage() {
  return <CartPageContent />;
}
