"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const PLACEHOLDER = "/placeholder.webp";

interface SafeImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
}

/**
 * SafeImage — renders a Next.js Image with automatic fallback to placeholder.webp.
 *
 * Uses `fill` so the parent MUST have an explicit size AND `position: relative`
 * (or `relative` Tailwind class). The parent also needs `overflow-hidden` for
 * rounded corners to work correctly.
 *
 * Handles both missing src (shows placeholder immediately) and load errors
 * (swaps to placeholder via onError).
 */
export function SafeImage({ src, alt, className }: SafeImageProps) {
  const [hasError, setHasError] = useState(false);

  const resolvedSrc = !src || hasError ? PLACEHOLDER : src;
  const isLocal = resolvedSrc.startsWith("/");

  return (
    <div className={cn("relative h-full w-full", className)}>
      <Image
        src={resolvedSrc}
        alt={alt}
        fill
        className={cn(
          "object-cover",
          !src && "opacity-40"
        )}
        onError={() => setHasError(true)}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        unoptimized={!isLocal}
      />
    </div>
  );
}
