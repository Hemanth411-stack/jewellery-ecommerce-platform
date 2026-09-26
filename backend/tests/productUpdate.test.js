import assert from "node:assert/strict";
import test from "node:test";
import Product from "../models/Product.js";
import { updateProductById } from "../services/productService.js";
import { omitUnchangedMedia } from "../../frontend/src/utils/productUpdate.js";

test("text updates omit unchanged media without mutating the form", () => {
  const original = { images: ["large-image"], video: "large-video", price: 100 };
  const update = omitUnchangedMedia({ ...original, price: 200 }, original);
  assert.deepEqual(update, { price: 200 });
  assert.equal(original.images[0], "large-image");
  assert.deepEqual(omitUnchangedMedia({ images: [], video: "" }, original), { images: [], video: "" });
  assert.deepEqual(omitUnchangedMedia({ images: ["b", "a"] }, { images: ["a", "b"] }), { images: ["b", "a"] });
});

test("price update preserves legacy media and skips Cloudinary and duplicate lookup", async (t) => {
  const existing = { sku: "RING", slug: "ring", images: ["data:image/png;base64,legacy"], video: "data:video/mp4;base64,legacy" };
  t.mock.method(Product, "findById", async () => existing);
  const duplicate = t.mock.method(Product, "findOne", async () => null);
  t.mock.method(Product, "findByIdAndUpdate", async (id, payload, options) => {
    assert.equal(Object.hasOwn(payload, "images"), false);
    assert.equal(Object.hasOwn(payload, "video"), false);
    assert.deepEqual(options.projection, { images: 0, video: 0 });
    return { _id: id, ...payload };
  });
  const updated = await updateProductById("ring", { name: "Ring", price: 250, stock: 3 });
  assert.equal(updated.price, 250);
  assert.equal(duplicate.mock.callCount(), 0);
});

test("explicit removal saves empty media and includes it in the response", async (t) => {
  t.mock.method(Product, "findById", async () => ({ sku: "RING", slug: "ring" }));
  t.mock.method(Product, "findByIdAndUpdate", async (id, payload, options) => {
    assert.deepEqual(payload.images, []);
    assert.equal(payload.video, "");
    assert.deepEqual(options.projection, {});
    return payload;
  });
  await updateProductById("ring", { name: "Ring", price: 1, stock: 1, images: [], video: "" });
});
