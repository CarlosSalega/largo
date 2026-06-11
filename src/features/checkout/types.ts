// ---------------------------------------------------------------------------
// Checkout domain types
// ---------------------------------------------------------------------------

import type { CartItem } from "@/features/cart/types";
import type { checkoutSchema } from "./schemas";
import type { z } from "zod";

export type CheckoutFormData = z.infer<typeof checkoutSchema>;

export type CheckoutStep = "customer" | "shipping" | "review";

export interface CheckoutState {
  currentStep: CheckoutStep;
}

export type CartItemPayload = Pick<
  CartItem,
  "productId" | "name" | "price" | "currency" | "quantity" | "image" | "stock"
>;

export interface ConfirmCheckoutInput {
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
  shipping: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  cartItems: CartItemPayload[];
}

export interface ConfirmCheckoutSuccess {
  orderId: string;
  orderNumber: string;
  init_point: string;
}

export interface ConfirmCheckoutError {
  error: string;
}

export type ConfirmCheckoutResult = ConfirmCheckoutSuccess | ConfirmCheckoutError;
