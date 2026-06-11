import { Truck, ShieldCheck, Headphones, CreditCard } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const benefits = [
  {
    icon: Truck,
    title: "Free Shipping",
    description:
      "Free shipping on all orders over $100. Delivered to your doorstep in 3-5 business days.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Shopping",
    description:
      "Your data is protected with industry-standard encryption. Shop with confidence.",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description:
      "Our support team is available around the clock to help with any questions or issues.",
  },
  {
    icon: CreditCard,
    title: "Easy Payments",
    description:
      "Multiple payment options including credit cards and Mercado Pago for your convenience.",
  },
];

export function Benefits() {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Why shop with us
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            We&apos;re committed to providing the best shopping experience for
            all your tech needs.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => (
            <Card
              key={benefit.title}
              className="border-none bg-background shadow-sm"
            >
              <CardContent className="pt-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                  <benefit.icon className="size-6 text-primary" />
                </div>
                <h3 className="text-base font-semibold text-foreground">
                  {benefit.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
