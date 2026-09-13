import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import { createOnlineOrderFromCart, verifyOnlinePayment } from "../services/orderService.js";

const originalFindOne = Order.findOne;
const originalFindOneAndUpdate = Order.findOneAndUpdate;
const originalCartUpdateOne = Cart.updateOne;
const originalCartFindOne = Cart.findOne;
const originalOrderSave = Order.prototype.save;
const originalFetch = globalThis.fetch;
const originalKeyId = process.env.RAZORPAY_KEY_ID;
const originalKeySecret = process.env.RAZORPAY_KEY_SECRET;

const order = {
  _id: "507f1f77bcf86cd799439011",
  paymentMethod: "ONLINE",
  paymentStatus: "pending",
  razorpayOrderId: "order_test123",
  grandTotal: 500,
};

test.after(() => {
  Order.findOne = originalFindOne;
  Order.findOneAndUpdate = originalFindOneAndUpdate;
  Cart.updateOne = originalCartUpdateOne;
  Cart.findOne = originalCartFindOne;
  Order.prototype.save = originalOrderSave;
  globalThis.fetch = originalFetch;
  if (originalKeyId === undefined) delete process.env.RAZORPAY_KEY_ID;
  else process.env.RAZORPAY_KEY_ID = originalKeyId;
  if (originalKeySecret === undefined) delete process.env.RAZORPAY_KEY_SECRET;
  else process.env.RAZORPAY_KEY_SECRET = originalKeySecret;
});

test("online checkout charges only the item price, including below the old shipping threshold", async () => {
  process.env.RAZORPAY_KEY_ID = "rzp_test_example";
  process.env.RAZORPAY_KEY_SECRET = "test_secret";
  const cart = {
    updatedAt: new Date(),
    items: [{
      product: { _id: "507f1f77bcf86cd799439013", name: "Ring", sku: "RING-1", price: 500, images: [] },
      quantity: 1,
    }],
  };
  Cart.findOne = () => ({ populate: async () => cart });
  let savedOrder;
  Order.prototype.save = async function save() { savedOrder = this; return this; };
  let requestedAmount;
  globalThis.fetch = async (_url, options) => {
    requestedAmount = JSON.parse(options.body).amount;
    return { ok: true, json: async () => ({ id: "order_mock" }) };
  };

  const result = await createOnlineOrderFromCart({
    userId: "507f1f77bcf86cd799439012",
    billingAddress: { fullName: "Test", phone: "123", addressLine1: "Street", city: "City", state: "State", postalCode: "12345", country: "India" },
    deliveryAddress: { fullName: "Test", phone: "123", addressLine1: "Street", city: "City", state: "State", postalCode: "12345", country: "India" },
  });
  assert.equal(requestedAmount, 50000);
  assert.equal(result.amount, 50000);
  assert.equal(savedOrder.itemsTotal, 500);
  assert.equal(savedOrder.shippingFee, 0);
  assert.equal(savedOrder.grandTotal, 500);
});

test("online payment rejects forged signatures and wrong amounts", async () => {
  process.env.RAZORPAY_KEY_ID = "rzp_test_example";
  process.env.RAZORPAY_KEY_SECRET = "test_secret";
  Order.findOne = async () => order;
  let fetchCount = 0;
  globalThis.fetch = async () => {
    fetchCount += 1;
    return {
      ok: true,
      json: async () => ({ order_id: order.razorpayOrderId, amount: 100, currency: "INR", status: "captured" }),
    };
  };

  const details = {
    userId: "507f1f77bcf86cd799439012",
    orderId: order._id,
    razorpayOrderId: order.razorpayOrderId,
    razorpayPaymentId: "pay_test123",
  };

  await assert.rejects(
    verifyOnlinePayment({ ...details, razorpaySignature: "0".repeat(64) }),
    /signature verification failed/
  );
  assert.equal(fetchCount, 0);

  const validSignature = createHmac("sha256", "test_secret")
    .update(`${order.razorpayOrderId}|${details.razorpayPaymentId}`)
    .digest("hex");
  await assert.rejects(
    verifyOnlinePayment({ ...details, razorpaySignature: validSignature }),
    /does not match the order/
  );
  assert.equal(fetchCount, 1);

  globalThis.fetch = async () => ({
    ok: true,
    json: async () => ({ order_id: order.razorpayOrderId, amount: 50000, currency: "INR", status: "captured" }),
  });
  const paidOrder = { ...order, paymentStatus: "paid", razorpayPaymentId: details.razorpayPaymentId };
  Order.findOneAndUpdate = async (query, update) => {
    assert.equal(query.paymentStatus, "pending");
    assert.equal(update.$set.razorpayPaymentId, details.razorpayPaymentId);
    return paidOrder;
  };
  let cleared = false;
  Cart.updateOne = async (query, update) => {
    assert.equal(query.user, details.userId);
    assert.deepEqual(update, { $set: { items: [] } });
    cleared = true;
  };
  assert.equal(
    await verifyOnlinePayment({ ...details, razorpaySignature: validSignature }),
    paidOrder
  );
  assert.equal(cleared, true);
});
