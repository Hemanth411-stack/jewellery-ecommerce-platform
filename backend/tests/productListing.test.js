import assert from "node:assert/strict";
import test from "node:test";
import Product from "../models/Product.js";
import { getProducts, getRelatedProducts } from "../services/productService.js";

const mockQuery = (t) => {
  const calls = [];
  const query = Object.fromEntries(["sort", "select", "slice", "limit"].map((method) => [method, (...args) => {
    calls.push([method, ...args]);
    return query;
  }]));
  t.mock.method(Product, "find", () => query);
  return calls;
};

test("storefront listing requests only a cover image and excludes video", async (t) => {
  const calls = mockQuery(t);
  await getProducts();
  assert.ok(calls.some(([method, value]) => method === "select" && value === "-video"));
  assert.ok(calls.some(([method, field, count]) => method === "slice" && field === "images" && count === 1));
});

test("admin listing keeps the complete gallery and video for editing", async (t) => {
  const calls = mockQuery(t);
  await getProducts({ includeInactive: true });
  assert.ok(!calls.some(([method]) => method === "select" || method === "slice"));
});

test("related product cards also omit unused gallery images and video", async (t) => {
  const calls = mockQuery(t);
  t.mock.method(Product, "findById", async () => ({ _id: "ring", category: "Rings" }));
  await getRelatedProducts("ring");
  assert.ok(calls.some(([method, value]) => method === "select" && value === "-video"));
  assert.ok(calls.some(([method, field, count]) => method === "slice" && field === "images" && count === 1));
});
