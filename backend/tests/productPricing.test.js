import assert from "node:assert/strict";
import test from "node:test";
import Product from "../models/Product.js";
import { createProductHandler } from "../controllers/productController.js";
import { createProduct } from "../services/productService.js";

const originalFindOne = Product.findOne;
const originalCreate = Product.create;

test.after(() => {
  Product.findOne = originalFindOne;
  Product.create = originalCreate;
});

test("option products derive their listing price and stock from options", async () => {
  Product.findOne = async () => null;
  Product.create = async (payload) => payload;
  const product = await createProduct({
    name: "Ring", category: "Rings", description: "Test ring",
    price: 9999, compareAtPrice: 12000, stock: 99,
    variants: [
      { color: "Gold", size: "12", price: 3500, stock: 2 },
      { color: "Silver", size: "14", price: 3000, stock: 4 },
    ],
  });
  assert.equal(product.price, 3000);
  assert.equal(product.stock, 6);
  assert.equal(product.compareAtPrice, 0);
});

test("option products need no base price, but every option needs its own price and stock", async () => {
  let response;
  let error;
  const res = { status(code) { this.statusCode = code; return this; }, json(body) { response = body; } };
  const next = (value) => { error = value; };

  await createProductHandler({ body: {
    name: "Ring", category: "Rings", description: "Test ring",
    variants: [{ color: "Gold", price: 3500, stock: 2 }],
  } }, res, next);
  assert.equal(error, undefined);
  assert.equal(res.statusCode, 201);
  assert.equal(response.product.price, 3500);

  error = undefined;
  await createProductHandler({ body: {
    name: "Ring", category: "Rings", description: "Test ring",
    variants: [{ color: "Gold", price: "", stock: 2 }],
  } }, res, next);
  assert.match(error.message, /valid price and stock/);
});
