"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { SafeImage } from "@/components/ui/safe-image";
import type { ProductImage } from "@/lib/db/types";

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const hasMultiple = images.length > 1;
  const currentImage = images[selectedIndex];

  if (images.length === 0) {
    return (
      <div className="aspect-square w-full rounded-2xl bg-muted overflow-hidden">
        <SafeImage src={null} alt={productName} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main image */}
      <div className="aspect-square w-full overflow-hidden rounded-2xl bg-muted">
        <SafeImage
          src={currentImage.url}
          alt={currentImage.alt ?? productName}
        />
      </div>

      {/* Thumbnail strip — only shown when multiple images exist */}
      {hasMultiple && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setSelectedIndex(index)}
              className={cn(
                "relative aspect-square w-16 md:w-20 shrink-0 overflow-hidden rounded-lg bg-muted transition-all duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                index === selectedIndex
                  ? "ring-2 ring-foreground ring-offset-2 ring-offset-background"
                  : "opacity-60 hover:opacity-100"
              )}
              aria-label={`View image ${index + 1} of ${images.length}`}
              aria-current={index === selectedIndex ? "true" : undefined}
            >
              <SafeImage
                src={image.url}
                alt={image.alt ?? `${productName} ${index + 1}`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
