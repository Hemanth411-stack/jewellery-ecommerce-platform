import sharp from "sharp";
import AppError from "./appError.js";

export const convertProductImage = async (image) => {
  // Remote URLs and formats other than PNG/JPEG retain their existing behaviour.
  if (!/^data:image\/(?:png|jpe?g);/i.test(image)) return image;

  const match = image.match(/^data:image\/(?:png|jpe?g);base64,([A-Za-z0-9+/\s]*={0,2})$/i);
  if (!match) throw new AppError("Invalid product image. Please upload a valid PNG or JPEG file.", 400);

  try {
    const input = Buffer.from(match[1], "base64");
    const pipeline = sharp(input, { limitInputPixels: 40000000 });
    const metadata = await pipeline.metadata();
    if (!["png", "jpeg"].includes(metadata.format)) throw new Error("Unexpected image format");
    // Preserve all frames in animated PNGs, as well as orientation and transparency.
    let output = await sharp(input, { limitInputPixels: 40000000, animated: true })
      .rotate()
      .webp({ lossless: true, effort: 6 })
      .toBuffer();
    // JPEG is already compressed: lossless WebP can expand it several times over.
    // Keep dimensions and alpha while using high-quality compression when needed.
    if (output.length > input.length || output.length > 1024 * 1024) {
      const compressed = await sharp(input, { limitInputPixels: 40000000, animated: true })
        .rotate()
        .webp({ quality: 90, alphaQuality: 100, effort: 6, smartSubsample: true })
        .toBuffer();
      if (compressed.length < output.length) output = compressed;
    }
    return `data:image/webp;base64,${output.toString("base64")}`;
  } catch {
    throw new AppError("Could not convert product image. Please upload a valid PNG or JPEG up to 40 megapixels.", 400);
  }
};

export const convertProductImages = async (images) => {
  const converted = [];
  // Process sequentially to limit peak memory when uploading several large photos.
  for (const image of images) converted.push(await convertProductImage(image));
  return converted;
};
