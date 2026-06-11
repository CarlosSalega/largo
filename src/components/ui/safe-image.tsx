"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const PLACEHOLDER = "/placeholder.webp";

interface SafeImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
}

/**
 * SafeImage — renders an image with automatic fallback to placeholder.webp.
 * Handles both missing src (shows placeholder immediately) and load errors
 * (swaps to placeholder via onError).
 */
export function SafeImage({ src, alt, className, width, height }: SafeImageProps) {
  const [hasError, setHasError] = useState(false);

  const resolvedSrc = !src || hasError ? PLACEHOLDER : src;

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      className={cn(
        "h-full w-full object-cover",
        !src && "opacity-40",
        className
      )}
      onError={() => setHasError(true)}
      width={width}
      height={height}
    />
  );
}
