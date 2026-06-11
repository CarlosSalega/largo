// ---------------------------------------------------------------------------
// Cloudinary config — v2 SDK singleton with env-var validation
// ---------------------------------------------------------------------------

import { v2 as cloudinary } from "cloudinary";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;
const UPLOAD_FOLDER = process.env.CLOUDINARY_UPLOAD_FOLDER ?? "largo";

if (!CLOUD_NAME) {
  throw new Error(
    "[Cloudinary] NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME no definida. Revisá el archivo .env."
  );
}
if (!API_KEY) {
  throw new Error(
    "[Cloudinary] CLOUDINARY_API_KEY no definida. Revisá el archivo .env."
  );
}
if (!API_SECRET) {
  throw new Error(
    "[Cloudinary] CLOUDINARY_API_SECRET no definida. Revisá el archivo .env."
  );
}

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET,
});

export { cloudinary, CLOUD_NAME, UPLOAD_FOLDER };
