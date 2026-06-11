import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      {/* Subtle radial gradient background */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-muted/50 via-background to-background" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Tecnología premium,{" "}
            <span className="text-primary">seleccionada para vos</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl">
            Descubrí lo último en tecnología de las marcas líderes. Desde
            smartphones hasta laptops — todo lo que necesitás en un solo lugar.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button asChild size="lg">
              <Link href="/catalog">Ver productos</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/catalog">Categorías</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
