import assert from "node:assert/strict";
import test from "node:test";
import sharp from "sharp";
import { randomBytes } from "node:crypto";
import { Writable } from "node:stream";
import { v2 as cloudinary } from "cloudinary";
import Product from "../models/Product.js";
import { createProduct, updateProductById } from "../services/productService.js";
import { convertProductImage, convertProductImages } from "../utils/productImages.js";

const asDataUrl = (format, buffer) => `data:image/${format};base64,${buffer.toString("base64")}`;
const decode = (url) => Buffer.from(url.split(",")[1], "base64");
const fixture = (format) => sharp({ create: {
  width: 16, height: 12, channels: 4, background: { r: 175, g: 110, b: 40, alpha: 0.5 },
} }).toFormat(format).toBuffer();

for (const format of ["png", "jpeg"]) {
  test(`${format} uploads become WebP without changing decoded pixels or dimensions`, async () => {
    const input = await fixture(format);
    const output = decode(await convertProductImage(asDataUrl(format, input)));
    const metadata = await sharp(output).metadata();
    assert.equal(metadata.format, "webp");
    assert.equal(metadata.width, 16);
    assert.equal(metadata.height, 12);
    assert.deepEqual(await sharp(output).ensureAlpha().raw().toBuffer(), await sharp(input).ensureAlpha().raw().toBuffer());
  });
}

test("existing WebP and remote URLs are unchanged and image order is retained", async () => {
  const png = asDataUrl("png", await fixture("png"));
  const webp = await convertProductImage(png);
  const url = "https://example.com/product.jpg";
  assert.deepEqual(await convertProductImages([url, png, webp]), [url, webp, webp]);
});

test("invalid PNG/JPEG uploads return a client error", async () => {
  for (const input of ["data:image/png;base64,broken", "data:image/jpeg;base64,%%%", "data:image/png;base64,"]) {
    await assert.rejects(convertProductImage(input), (error) => error.statusCode === 400);
  }
});

test("JPEG photos do not expand into large lossless WebP images", async () => {
  const input = await sharp(randomBytes(512 * 512 * 3), {
    raw: { width: 512, height: 512, channels: 3 },
  }).jpeg({ quality: 85 }).toBuffer();
  const lossless = await sharp(input).webp({ lossless: true, effort: 6 }).toBuffer();
  assert.ok(lossless.length > input.length);
  const output = decode(await convertProductImage(asDataUrl("jpeg", input)));
  const metadata = await sharp(output).metadata();
  assert.equal(metadata.format, "webp");
  assert.equal(metadata.width, 512);
  assert.equal(metadata.height, 512);
  assert.ok(output.length < lossless.length / 2);
});

test("both create and update persist Cloudinary URLs instead of embedded images", async (t) => {
  for (const name of ["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"]) {
    const previous = process.env[name];
    process.env[name] = "test";
    t.after(() => { if (previous === undefined) delete process.env[name]; else process.env[name] = previous; });
  }
  t.mock.method(cloudinary.uploader, "upload_stream", (options, callback) => new Writable({
    write(chunk, encoding, done) { done(); },
    final(done) { callback(null, { secure_url: "https://res.cloudinary.com/test/image/upload/photo.webp" }); done(); },
  }));
  t.mock.method(Product, "findOne", async () => null);
  t.mock.method(Product, "create", async (payload) => payload);
  t.mock.method(Product, "findById", async () => ({ slug: "ring", sku: "RING" }));
  t.mock.method(Product, "findByIdAndUpdate", async (id, payload) => payload);
  const payload = {
    name: "Ring", category: "Rings", description: "Gold ring", price: 100, stock: 1,
    images: [asDataUrl("png", await fixture("png"))],
  };
  assert.equal((await createProduct(payload)).images[0], "https://res.cloudinary.com/test/image/upload/photo.webp");
  assert.equal((await updateProductById("product-id", payload)).images[0], "https://res.cloudinary.com/test/image/upload/photo.webp");
});
