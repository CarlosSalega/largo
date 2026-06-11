import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProductStockProps {
  stock: number;
}

type StockVariant = "in-stock" | "low-stock" | "out-of-stock";

interface StockStatus {
  label: string;
  variant: StockVariant;
}

function getStockStatus(stock: number): StockStatus {
  if (stock === 0) return { label: "Out of stock", variant: "out-of-stock" };
  if (stock <= 10)
    return { label: `Only ${stock} left`, variant: "low-stock" };
  return { label: "In stock", variant: "in-stock" };
}

const statusClasses: Record<StockVariant, { dot: string; text: string }> = {
  "in-stock": {
    dot: "bg-emerald-500",
    text: "text-emerald-600",
  },
  "low-stock": {
    dot: "bg-amber-500",
    text: "text-amber-600",
  },
  "out-of-stock": {
    dot: "bg-destructive",
    text: "text-destructive",
  },
};

export function ProductStock({ stock }: ProductStockProps) {
  const { label, variant } = getStockStatus(stock);
  const classes = statusClasses[variant];

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
      {/* Status indicator */}
      <div className="flex items-center gap-2.5">
        <span
          className={cn("inline-block h-2.5 w-2.5 rounded-full", classes.dot)}
          aria-hidden="true"
        />
        <span className={cn("text-sm font-medium", classes.text)}>
          {label}
        </span>
      </div>

      {/* Add to cart button — wired in Release 2 */}
      <Button size="lg" className="w-full" disabled={stock === 0}>
        {stock === 0 ? "Out of stock" : "Add to cart"}
      </Button>
    </div>
  );
}
