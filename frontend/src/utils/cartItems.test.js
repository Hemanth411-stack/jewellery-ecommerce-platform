import assert from "node:assert/strict";
import test from "node:test";
import { getAvailableCartItems } from "./cartItems.js";

test("deleted products cannot reach cart totals or checkout rendering", () => {
  const valid = { product: { _id: "ring", price: 250 }, quantity: 2 };
  const items = getAvailableCartItems([{ product: null, quantity: 1 }, valid, null, {}]);
  assert.deepEqual(items, [valid]);
  assert.equal(items.reduce((total, item) => total + item.product.price * item.quantity, 0), 500);
});

test("missing cart data produces an empty cart", () => {
  for (const input of [null, undefined, {}, [{ product: null }]]) {
    assert.deepEqual(getAvailableCartItems(input), []);
  }
});
