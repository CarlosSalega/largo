// ---------------------------------------------------------------------------
// Admin Image Upload API — POST (upload) + DELETE (remove)
// ADMIN auth required. Uses Cloudinary singleton from src/lib/cloudinary/config.ts
// ---------------------------------------------------------------------------

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { cloudinary, UPLOAD_FOLDER } from "@/lib/cloudinary/config";
import { headers } from "next/headers";

// ── Validation constants ────────────────────────────────────────────────────
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

// ── Shared auth check ───────────────────────────────────────────────────────

async function checkAdminAuth(): Promise<NextResponse | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  return null; // Authorised — continue
}

// ── File validation ─────────────────────────────────────────────────────────

function validateFile(file: File): string | null {
  if (!(ALLOWED_MIME_TYPES as readonly string[]).includes(file.type)) {
    return `Tipo de archivo no permitido: ${file.type}. Formatos aceptados: JPG, PNG, WebP, GIF.`;
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `El archivo supera el tamaño máximo de 10 MB.`;
  }

  if (file.size === 0) {
    return "El archivo está vacío.";
  }

  return null;
}

// ── POST /api/admin/upload ──────────────────────────────────────────────────

export async function POST(request: Request): Promise<NextResponse> {
  // Auth gate
  const authError = await checkAdminAuth();
  if (authError) return authError;

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "No se recibió ningún archivo." },
        { status: 400 },
      );
    }

    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary via upload_stream
    const result = await new Promise<{
      public_id: string;
      secure_url: string;
    }>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: UPLOAD_FOLDER,
            resource_type: "image",
            quality: "auto",
            fetch_format: "auto",
          },
          (error, response) => {
            if (error) {
              reject(
                new Error(
                  `Error al subir la imagen: ${error.message}`,
                ),
              );
            } else if (!response) {
              reject(new Error("No se recibió respuesta de Cloudinary."));
            } else {
              resolve(response);
            }
          },
        )
        .end(buffer);
    });

    return NextResponse.json({
      success: true,
      key: result.public_id,
      url: result.secure_url,
    });
  } catch (error) {
    console.error("[admin/upload] POST error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Error interno al subir la imagen.",
      },
      { status: 500 },
    );
  }
}

// ── DELETE /api/admin/upload ────────────────────────────────────────────────

export async function DELETE(request: Request): Promise<NextResponse> {
  // Auth gate
  const authError = await checkAdminAuth();
  if (authError) return authError;

  try {
    let body: { key?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Cuerpo de la solicitud inválido." },
        { status: 400 },
      );
    }

    const { key } = body;

    if (!key || typeof key !== "string") {
      return NextResponse.json(
        { error: "Se requiere el campo 'key' (public_id de Cloudinary)." },
        { status: 400 },
      );
    }

    const result = await cloudinary.uploader.destroy(key);

    // "not found" is treated as success — idempotent
    const ok = result.result === "ok" || result.result === "not found";

    if (!ok) {
      return NextResponse.json(
        { error: `Error al eliminar la imagen: ${result.result}` },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[admin/upload] DELETE error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Error interno al eliminar la imagen.",
      },
      { status: 500 },
    );
  }
}
