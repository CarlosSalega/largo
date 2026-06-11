// ---------------------------------------------------------------------------
// Cloudinary URL resolver — generates transformed URLs from public IDs
// Simplified for Largo: Cloudinary-only with predefined variants
// ---------------------------------------------------------------------------

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;

const TRANSFORMS = {
  thumbnail: "w_300,h_225,c_fill,f_auto,q_auto,dpr_auto",
  card: "w_400,h_300,c_fill,f_auto,q_auto,dpr_auto",
  detail: "w_800,h_600,c_fill,f_auto,q_auto,dpr_auto",
  fullscreen: "w_1200,h_900,c_limit,f_auto,q_auto,dpr_auto",
} as const;

export type CloudinaryVariant = keyof typeof TRANSFORMS;

/**
 * Build a Cloudinary transformed URL from a public ID.
 *
 * @param key  - Cloudinary `public_id` (with or without file extension)
 * @param variant - Transformation preset (default: "card")
 * @returns full Cloudinary URL with transformations applied
 */
export function resolveCloudinaryUrl(
  key: string,
  variant: CloudinaryVariant = "card",
): string {
  const cleanKey = key.replace(/\.(webp|jpg|jpeg|png|gif)$/i, "");
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${TRANSFORMS[variant]}/${cleanKey}`;
}
