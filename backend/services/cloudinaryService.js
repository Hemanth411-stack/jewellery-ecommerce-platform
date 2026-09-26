import { createHash } from "node:crypto";
import { v2 as cloudinary } from "cloudinary";
import AppError from "../utils/appError.js";

export const assertCloudinaryConfigured = () => {
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const api_key = process.env.CLOUDINARY_API_KEY?.trim();
  const api_secret = process.env.CLOUDINARY_API_SECRET?.trim();
  if (!cloud_name || !api_key || !api_secret) {
    throw new AppError("Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in backend/.env and restart the server.", 503);
  }
  cloudinary.config({ cloud_name, api_key, api_secret, secure: true });
};

const imageTypes = new Set(["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif", "image/avif"]);
const videoTypes = new Set(["video/mp4", "video/webm", "video/quicktime", "video/x-m4v", "video/mpeg", "video/ogg"]);

export const uploadProductMedia = async (buffer, mimeType) => {
  const resourceType = imageTypes.has(mimeType) ? "image" : videoTypes.has(mimeType) ? "video" : null;
  if (!resourceType) throw new AppError("Upload a PNG, JPEG, WebP, GIF or AVIF image, or a supported video such as MP4 or WebM.", 400);
  const maxBytes = (resourceType === "image" ? 10 : 50) * 1024 * 1024;
  if (!buffer.length || buffer.length > maxBytes) throw new AppError(`Upload ${resourceType === "image" ? "an image up to 10 MB" : "a video up to 50 MB"}.`, 413);
  assertCloudinaryConfigured();
  const hash = createHash("sha256").update(buffer).digest("hex");
  try {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({
        resource_type: resourceType,
        public_id: `himapriya/products/${resourceType}/${hash}`,
        overwrite: false,
        timeout: 120000,
        ...(resourceType === "image" ? { format: "webp", quality: 90 } : {}),
      }, (error, response) => error ? reject(error) : resolve(response));
      stream.on("error", reject);
      stream.end(buffer);
    });
    if (!result?.secure_url?.startsWith("https://")) throw new Error("Missing secure media URL");
    return { url: result.secure_url, resourceType };
  } catch (error) {
    if (String(error?.message || "").includes("cloud_name mismatch")) {
      throw new AppError("Cloudinary cloud name and API credentials do not match. Copy all three values from the same Cloudinary product environment into backend/.env and restart the server.", 502);
    }
    throw new AppError("Cloudinary upload failed. Check the backend Cloudinary credentials, account upload limits and connection, then try again.", 502);
  }
};

const uploadEmbeddedMedia = async (value, type) => {
  if (!value?.startsWith("data:")) return value;
  const match = value.match(/^data:([^;,]+);base64,([A-Za-z0-9+/\s]*={0,2})$/);
  if (!match || !match[1].startsWith(`${type}/`)) throw new AppError(`Invalid ${type} upload. Choose the file again.`, 400);
  return (await uploadProductMedia(Buffer.from(match[2], "base64"), match[1])).url;
};

export const storeProductMedia = async ({ images = [], video = "" }) => {
  const storedImages = [];
  for (const image of images) storedImages.push(await uploadEmbeddedMedia(image, "image"));
  return { images: storedImages, video: await uploadEmbeddedMedia(video, "video") };
};
