// ---------------------------------------------------------------------------
// useImageUpload — client hook for admin image upload + remove
// Features: file validation, per-file progress, optimistic remove with rollback, sonner toasts
// ---------------------------------------------------------------------------

"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";

// ── Validation constants ────────────────────────────────────────────────────
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_FILES_DEFAULT = 10;

// ── Types ───────────────────────────────────────────────────────────────────

interface UseImageUploadOptions {
  /** Current image keys (Cloudinary public IDs) */
  value: string[];
  /** Callback to update the parent's value */
  onChange: (value: string[]) => void;
  /** Max images allowed (default: 10) */
  maxImages?: number;
}

interface UseImageUploadReturn {
  uploading: boolean;
  /** Per-file upload progress (0-100) */
  progress: number;
  /** Upload one or more files */
  upload: (files: File[]) => Promise<void>;
  /** Remove an image by its Cloudinary public ID */
  remove: (key: string) => Promise<void>;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function validateFiles(
  files: File[],
  currentCount: number,
  maxImages: number,
): string | null {
  if (currentCount + files.length > maxImages) {
    return `Máximo ${maxImages} imágenes permitidas. Ya tenés ${currentCount}.`;
  }

  for (const file of files) {
    if (!(ALLOWED_MIME_TYPES as readonly string[]).includes(file.type)) {
      return `${file.name}: tipo de archivo no permitido (${file.type}). Formatos aceptados: JPG, PNG, WebP, GIF.`;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return `${file.name}: supera el tamaño máximo de 10 MB.`;
    }

    if (file.size === 0) {
      return `${file.name}: el archivo está vacío.`;
    }
  }

  return null;
}

// ── Hook ────────────────────────────────────────────────────────────────────

export function useImageUpload({
  value,
  onChange,
  maxImages = MAX_FILES_DEFAULT,
}: UseImageUploadOptions): UseImageUploadReturn {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const upload = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;

      // Client-side validation
      const validationError = validateFiles(files, value.length, maxImages);
      if (validationError) {
        toast.error(validationError);
        return;
      }

      setUploading(true);
      setProgress(0);

      try {
        let completed = 0;

        const uploadedKeys = await Promise.all(
          files.map(async (file) => {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/admin/upload", {
              method: "POST",
              body: formData,
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
              throw new Error(data.error ?? "Error al subir la imagen");
            }

            completed++;
            setProgress(Math.round((completed / files.length) * 100));

            return data.key as string;
          }),
        );

        onChange([...value, ...uploadedKeys]);

        toast.success(
          uploadedKeys.length === 1
            ? "Imagen subida correctamente"
            : `${uploadedKeys.length} imágenes subidas correctamente`,
        );
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Error al subir las imágenes",
        );
      } finally {
        setUploading(false);
        setProgress(0);
      }
    },
    [value, onChange, maxImages],
  );

  const remove = useCallback(
    async (key: string) => {
      // Optimistic update — remove immediately
      const previous = value;
      onChange(value.filter((k) => k !== key));

      try {
        const res = await fetch("/api/admin/upload", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key }),
        });

        if (!res.ok) {
          // Rollback
          onChange(previous);
          const data = await res.json().catch(() => ({}));
          toast.error(data.error ?? "Error al eliminar la imagen");
        }
      } catch {
        // Rollback on network error
        onChange(previous);
        toast.error("Error de conexión al eliminar la imagen");
      }
    },
    [value, onChange],
  );

  return { uploading, progress, upload, remove };
}
