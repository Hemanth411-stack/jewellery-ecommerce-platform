import assert from "node:assert/strict";
import test from "node:test";
import { randomBytes } from "node:crypto";
import sharp from "sharp";
import { cartResponse, createProductPreview, wishlistResponse } from "../utils/productPreview.js";

test("cart previews shrink media without changing originals, prices, quantities or variants", async () => {
  const image = `data:image/png;base64,${(await sharp(randomBytes(800 * 800 * 3), { raw: { width: 800, height: 800, channels: 3 } }).png().toBuffer()).toString("base64")}`;
  const product = { _id: "ring", price: 799, images: [image, image], video: "large-video" };
  const cart = { items: [{ product, quantity: 2, variantId: "gold", variant: { price: 899 } }] };
  const result = await cartResponse(cart);
  const preview = result.items[0].product.images[0];
  assert.ok(preview.length < image.length / 5);
  const metadata = await sharp(Buffer.from(preview.split(",")[1], "base64")).metadata();
  assert.equal(metadata.width, 480);
  assert.equal(result.items[0].product.price, 799);
  assert.equal(result.items[0].quantity, 2);
  assert.equal(result.items[0].variant.price, 899);
  assert.equal(result.items[0].product.video, undefined);
  assert.equal(product.images.length, 2);
  assert.equal(product.images[0], image);
  assert.equal(await createProductPreview(image), preview);
  const wishlist = await wishlistResponse({ products: [product, null] });
  assert.equal(wishlist.products.length, 1);
  assert.equal(wishlist.products[0].images[0], preview);
});

test("remote and unreadable images do not break cart responses", async () => {
  for (const source of ["https://example.com/image.jpg", "data:image/png;base64,broken", undefined]) {
    assert.equal(await createProductPreview(source), source);
  }
});
