// ---------------------------------------------------------------------------
// ImageUpload — drag-and-drop image upload component for admin forms
// Features: click-to-upload, drag reorder, progress tracking, optimistic remove, empty/max states
// ---------------------------------------------------------------------------

"use client";

import { useRef } from "react";
import { X, ImagePlus, Loader2, GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Button } from "@/components/ui/button";
import { useImageUpload } from "@/features/admin/hooks/use-image-upload";
import { useImageReorder } from "@/features/admin/hooks/use-image-reorder";
import { resolveCloudinaryUrl } from "@/lib/cloudinary/resolve-url";

// ── Constants ───────────────────────────────────────────────────────────────

const DEFAULT_MAX_IMAGES = 10;

const ALLOWED_MIME_STRINGS = "image/jpeg,image/png,image/webp,image/gif";

// ── Types ───────────────────────────────────────────────────────────────────

interface ImageUploadProps {
  /** Current image keys (Cloudinary public IDs) */
  value: string[];
  /** Called whenever images are added, removed, or reordered */
  onChange: (value: string[]) => void;
  /** Maximum number of images allowed (default: 10) */
  maxImages?: number;
  /** Disable upload interactions */
  disabled?: boolean;
}

// ── Sortable Image Item ─────────────────────────────────────────────────────

function SortableImage({
  id,
  index,
  onRemove,
  disabled,
}: {
  id: string;
  index: number;
  onRemove: (key: string) => void;
  disabled: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative aspect-4/3 overflow-hidden rounded-lg border border-border bg-muted"
    >
      {/* Thumbnail */}
      <img
        src={resolveCloudinaryUrl(id, "thumbnail")}
        alt={`Imagen ${index + 1}`}
        loading="lazy"
        decoding="async"
        className="size-full object-cover transition-transform group-hover:scale-105"
      />

      {/* Drag handle */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="absolute top-1 left-1 cursor-grab rounded-full bg-card/80 p-1 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 active:cursor-grabbing"
        aria-label={`Reordenar imagen ${index + 1}`}
      >
        <GripVertical className="size-3.5 text-muted-foreground" />
      </button>

      {/* Remove button */}
      <button
        type="button"
        onClick={() => onRemove(id)}
        disabled={disabled}
        className="absolute top-1 right-1 rounded-full bg-destructive p-1.5 text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100 disabled:cursor-not-allowed hover:bg-destructive/90"
        aria-label={`Eliminar imagen ${index + 1}`}
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────

export function ImageUpload({
  value,
  onChange,
  maxImages = DEFAULT_MAX_IMAGES,
  disabled = false,
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploading, progress, upload, remove } = useImageUpload({
    value,
    onChange,
    maxImages,
  });
  const { dndContext, sortableContext } = useImageReorder({
    keys: value,
    onChange,
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    await upload(files);
    // Reset input to allow re-selecting the same file
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const isAtLimit = value.length >= maxImages;
  const isButtonDisabled = disabled || uploading || isAtLimit;

  return (
    <div className="flex flex-col gap-4">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_MIME_STRINGS}
        multiple
        onChange={handleFileSelect}
        className="hidden"
        disabled={isButtonDisabled}
      />

      {/* Upload button */}
      <Button
        type="button"
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        disabled={isButtonDisabled}
        className="w-fit"
      >
        {uploading ? (
          <>
            <Loader2
              className="animate-spin"
              data-icon="inline-start"
            />
            Subiendo... {progress}%
          </>
        ) : (
          <>
            <ImagePlus data-icon="inline-start" />
            Subir imágenes ({value.length}/{maxImages})
          </>
        )}
      </Button>

      {/* Grid or empty state */}
      {value.length > 0 ? (
        dndContext(
          sortableContext(
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
              {value.map((key, index) => (
                <SortableImage
                  key={key}
                  id={key}
                  index={index}
                  onRemove={remove}
                  disabled={uploading}
                />
              ))}
            </div>,
          ),
        )
      ) : (
        <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-border bg-card">
          <p className="text-sm text-muted-foreground">
            No hay imágenes. Hacé clic en &quot;Subir imágenes&quot; para
            agregar.
          </p>
        </div>
      )}
    </div>
  );
}
