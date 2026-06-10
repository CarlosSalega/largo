import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import type { Category } from "@/lib/db/types";

interface FeaturedCategoriesProps {
  categories: Category[];
}

export function FeaturedCategories({ categories }: FeaturedCategoriesProps) {
  if (categories.length === 0) return null;

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Shop by Category
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Browse our curated selection of product categories to find exactly
            what you need.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link key={category.id} href={`/catalog?category=${category.slug}`}>
              <Card className="group h-full transition-shadow hover:shadow-md">
                <CardContent className="p-0">
                  {category.image ? (
                    <div className="aspect-video w-full overflow-hidden rounded-t-xl bg-muted">
                      <img
                        src={category.image}
                        alt={category.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video w-full rounded-t-xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                      <span className="text-2xl font-bold text-muted-foreground/30">
                        {category.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {category.description}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
