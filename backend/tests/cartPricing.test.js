import assert from "node:assert/strict";
import test from "node:test";
import mongoose from "mongoose";
import Cart from "../models/Cart.js";
import { getCartItemPrice as backendPrice } from "../utils/cartPricing.js";
import { getCartItemPrice as frontendPrice } from "../../frontend/src/utils/cartItems.js";

for (const [label, getPrice] of [["cart and checkout", frontendPrice], ["order", backendPrice]]) {
  test(`${label} ignores legacy zero option prices for products without a selected option`, () => {
    const item = { product: { price: 1299 }, variantId: "", variant: { price: 0 }, quantity: 2 };
    assert.equal(getPrice(item), 1299);
    assert.equal(getPrice(item) * item.quantity, 2598);
    assert.equal(getPrice({ product: { price: 799 } }), 799);
  });

  test(`${label} uses the selected option price, including a legitimate zero`, () => {
    const item = { product: { price: 1299 }, variantId: "gold", variant: { price: 1599 } };
    assert.equal(getPrice(item), 1599);
    assert.equal(getPrice({ ...item, variant: { price: 0 } }), 0);
  });
}

test("new cart items do not get an artificial zero option price", () => {
  const cart = new Cart({ user: new mongoose.Types.ObjectId(), items: [{ product: new mongoose.Types.ObjectId(), quantity: 1 }] });
  assert.equal(cart.items[0].variant.price, undefined);
});
