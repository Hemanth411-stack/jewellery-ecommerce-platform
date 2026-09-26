import assert from "node:assert/strict";
import test from "node:test";
import Product from "../models/Product.js";
import { createProduct, updateProductById } from "../services/productService.js";
import { validateProductSize } from "../utils/productSize.js";

test("size validation includes retained fields and UTF-8 byte sizes", () => {
  assert.doesNotThrow(() => validateProductSize({ name: "Ring", images: [] }));
  assert.throws(() => validateProductSize({ name: "Ring" }, { video: "a".repeat(16 * 1024 * 1024) }), { statusCode: 413 });
  assert.throws(() => validateProductSize({ description: "金".repeat(6 * 1024 * 1024) }), { statusCode: 413 });
});

test("oversized media never reaches MongoDB writes on create or update", async (t) => {
  t.mock.method(Product, "findOne", async () => null);
  t.mock.method(Product, "findById", async () => ({ sku: "RING", slug: "ring" }));
  const create = t.mock.method(Product, "create", async () => {});
  const update = t.mock.method(Product, "findByIdAndUpdate", async () => {});
  const payload = { name: "Ring", price: 100, stock: 1, video: "a".repeat(17 * 1024 * 1024) };
  await assert.rejects(createProduct(payload), { statusCode: 413 });
  await assert.rejects(updateProductById("ring", payload), { statusCode: 413 });
  assert.equal(create.mock.callCount(), 0);
  assert.equal(update.mock.callCount(), 0);
});
