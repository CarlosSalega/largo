"use client";

// ---------------------------------------------------------------------------
// CheckoutForm — multi-step wizard with FormProvider
// ---------------------------------------------------------------------------

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/features/cart/store";
import { checkoutSchema } from "../schemas";
import { CustomerStep } from "./CustomerStep";
import { ShippingStep } from "./ShippingStep";
import { ReviewStep } from "./ReviewStep";
import { confirmCheckout } from "../actions";
import type { CheckoutFormData, CheckoutStep } from "../types";
import type { Resolver } from "react-hook-form";

// ---- Step indicator -------------------------------------------------------

const STEPS: { key: CheckoutStep; label: string }[] = [
  { key: "customer", label: "Datos personales" },
  { key: "shipping", label: "Envío" },
  { key: "review", label: "Revisión" },
];

const STEP_INDEX: Record<CheckoutStep, number> = {
  customer: 0,
  shipping: 1,
  review: 2,
};

export function CheckoutForm() {
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("customer");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();
  const clearCart = useCartStore((s) => s.clearCart);
  const items = useCartStore((s) => s.items);

  const methods = useForm<CheckoutFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(checkoutSchema) as unknown as Resolver<CheckoutFormData>,
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "Argentina",
    },
  });

  const goTo = (step: CheckoutStep) => setCurrentStep(step);

  const handleConfirm = async () => {
    const values = methods.getValues();

    // Validate all fields one final time
    const valid = await methods.trigger();
    if (!valid) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await confirmCheckout({
        customer: {
          name: values.name,
          email: values.email,
          phone: values.phone || undefined,
        },
        shipping: {
          street: values.street,
          city: values.city,
          state: values.state,
          zipCode: values.zipCode,
          country: values.country,
        },
        cartItems: items.map((item) => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          currency: item.currency,
          quantity: item.quantity,
          image: item.image,
          stock: item.stock,
        })),
      });

      if ("error" in result) {
        setErrorMessage(result.error);
        setIsSubmitting(false);
        return;
      }

      // Success: clear cart and redirect
      clearCart();
      router.push(`/checkout/success?orderNumber=${result.orderNumber}`);
    } catch {
      setErrorMessage(
        "Ocurrió un error al procesar tu pedido. Intentá de nuevo."
      );
      setIsSubmitting(false);
    }
  };

  const currentIndex = STEP_INDEX[currentStep];

  return (
    <FormProvider {...methods}>
      <div className="mx-auto max-w-lg">
        {/* Step indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, i) => (
              <div key={step.key} className="flex items-center">
                {/* Step circle */}
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                    i <= currentIndex
                      ? "bg-blue-600 text-white"
                      : "bg-slate-700 text-slate-400"
                  }`}
                >
                  {i + 1}
                </div>
                {/* Connector line */}
                {i < STEPS.length - 1 && (
                  <div
                    className={`mx-2 h-px w-12 sm:w-20 ${
                      i < currentIndex ? "bg-blue-600" : "bg-slate-700"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
            {STEPS.map((step) => (
              <span key={step.key}>{step.label}</span>
            ))}
          </div>
        </div>

        {/* Progress fraction */}
        <p className="mb-6 text-center text-sm text-slate-400">
          Paso {currentIndex + 1} de {STEPS.length}
        </p>

        {/* Step content */}
        {currentStep === "customer" && (
          <CustomerStep onNext={() => goTo("shipping")} />
        )}
        {currentStep === "shipping" && (
          <ShippingStep
            onNext={() => goTo("review")}
            onBack={() => goTo("customer")}
          />
        )}
        {currentStep === "review" && (
          <ReviewStep
            onBack={() => goTo("shipping")}
            onConfirm={handleConfirm}
            isSubmitting={isSubmitting}
            errorMessage={errorMessage}
          />
        )}
      </div>
    </FormProvider>
  );
}
