import assert from "node:assert/strict";
import test from "node:test";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import { addItemToCart, getCartForUser, removeItemFromCart } from "../services/cartService.js";

test("cart fetch excludes deleted products and retains valid items", async (t) => {
  const valid = { product: { _id: "ring", price: 250 }, quantity: 2 };
  const cart = { items: [{ product: null, quantity: 1 }, valid] };
  t.mock.method(Cart, "findOne", () => ({ populate: async () => cart }));
  assert.deepEqual((await getCartForUser("user")).items, [valid]);
});

test("adding to an existing cart reads it once and populates only cover data after saving", async (t) => {
  const product = { _id: "ring", isActive: true, stock: 10, variants: [] };
  t.mock.method(Product, "findById", () => ({ select: async (fields) => {
    assert.equal(fields, "isActive stock variants");
    return product;
  } }));
  let saved = false;
  let populated = 0;
  const cart = {
    items: [{ product: { _id: "ring" }, quantity: 1 }],
    save: async () => { saved = true; },
    populate: async (options) => {
      assert.equal(saved, true);
      assert.deepEqual(options.select.images, { $slice: 1 });
      assert.equal(options.select.video, undefined);
      populated++;
      return cart;
    },
  };
  const read = t.mock.method(Cart, "findOne", async () => cart);
  const result = await addItemToCart("user", "ring", 2);
  assert.equal(result.items[0].quantity, 3);
  assert.equal(read.mock.callCount(), 1);
  assert.equal(populated, 1);
  await assert.rejects(addItemToCart("user", "ring", 20), { statusCode: 400 });
});

test("removing an item works when another product has been deleted", async (t) => {
  let saved = false;
  const cart = { items: [{ product: null }, { product: { _id: "ring" }, quantity: 1 }], save: async () => { saved = true; } };
  t.mock.method(Cart, "findOne", () => ({ populate: async () => cart }));
  assert.deepEqual((await removeItemFromCart("user", "ring")).items, []);
  assert.equal(saved, true);
});
