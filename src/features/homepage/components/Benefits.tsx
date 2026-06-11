import { Truck, ShieldCheck, Headphones, CreditCard } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const benefits = [
  {
    icon: Truck,
    title: "Envío gratis",
    description:
      "Envío sin cargo en compras superiores a $100.000. Llega a tu puerta en 3-5 días hábiles.",
  },
  {
    icon: ShieldCheck,
    title: "Compra segura",
    description:
      "Tus datos están protegidos con encriptación de nivel bancario. Comprá con tranquilidad.",
  },
  {
    icon: Headphones,
    title: "Soporte 24/7",
    description:
      "Nuestro equipo está disponible todo el día para ayudarte con cualquier consulta.",
  },
  {
    icon: CreditCard,
    title: "Pago fácil",
    description:
      "Múltiples medios de pago incluyendo tarjetas de crédito y Mercado Pago.",
  },
];

export function Benefits() {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            ¿Por qué comprar con nosotros?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Nos comprometemos a darte la mejor experiencia de compra para todos
            tus productos tecnológicos.
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
