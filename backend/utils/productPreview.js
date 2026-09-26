import { createHash } from "node:crypto";
import sharp from "sharp";

// Cache only small previews, never full upload data. A changed image gets a new key.
const previews = new Map();
let cacheBytes = 0;
const MAX_CACHE_BYTES = 8 * 1024 * 1024;

export const createProductPreview = async (image) => {
  if (typeof image === "string" && image.startsWith("https://res.cloudinary.com/")) {
    return image.replace("/image/upload/", "/image/upload/c_limit,w_480,h_480,q_auto:good,f_webp/");
  }
  if (typeof image !== "string" || !image.startsWith("data:image/")) return image;
  const match = image.match(/^data:image\/(?:png|jpe?g|webp);base64,([A-Za-z0-9+/\s]+=*)$/i);
  if (!match) return image;
  const key = createHash("sha256").update(image).digest("hex");
  if (previews.has(key)) {
    const cached = previews.get(key);
    previews.delete(key);
    previews.set(key, cached);
    return cached;
  }
  try {
    const buffer = await sharp(Buffer.from(match[1], "base64"), { limitInputPixels: 40000000 })
      .rotate().resize({ width: 480, height: 480, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82, effort: 3 }).toBuffer();
    const preview = `data:image/webp;base64,${buffer.toString("base64")}`;
    const result = preview.length < image.length ? preview : image;
    if (result.length <= MAX_CACHE_BYTES) {
      // Another request may have populated this key while Sharp was working.
      if (previews.has(key)) { cacheBytes -= previews.get(key).length; previews.delete(key); }
      while (previews.size && (cacheBytes + result.length > MAX_CACHE_BYTES || previews.size >= 64)) {
        const oldest = previews.keys().next().value;
        cacheBytes -= previews.get(oldest).length;
        previews.delete(oldest);
      }
      previews.set(key, result);
      cacheBytes += result.length;
    }
    return result;
  } catch {
    // A legacy/unreadable image must not prevent a cart or wishlist action.
    return image;
  }
};

const productPreview = async (product) => {
  if (!product) return product;
  const { images, video, ...fields } = product;
  return { ...fields, images: images?.length ? [await createProductPreview(images[0])] : [] };
};

export const cartResponse = async (cart) => {
  const data = cart.toObject ? cart.toObject() : cart;
  const items = [];
  for (const item of data.items) items.push({ ...item, product: await productPreview(item.product) });
  return { ...data, items };
};

export const wishlistResponse = async (wishlist) => {
  const data = wishlist.toObject ? wishlist.toObject() : wishlist;
  const products = [];
  for (const product of data.products) if (product) products.push(await productPreview(product));
  return { ...data, products };
};
