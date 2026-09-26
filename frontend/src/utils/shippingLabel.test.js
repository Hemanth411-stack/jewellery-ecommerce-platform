import assert from "node:assert/strict";
import test from "node:test";
import { buildShippingLabel } from "./shippingLabel.js";

const address = { fullName: "Shop", phone: "1234567890", addressLine1: "Sender Street", addressLine2: "", city: "City", state: "State", postalCode: "500001", country: "India" };
const senders = { DTDC: { ...address, fullName: "DTDC Sender" }, Postman: { ...address, fullName: "Postman Sender" } };
const order = { _id: "order123", deliveryAddress: { ...address, fullName: "Customer", addressLine1: "Customer Street" }, billingAddress: { ...address, fullName: "Billing Only" } };

test("labels select the matching sender and use delivery, not billing, address", () => {
  for (const provider of ["DTDC", "Postman"]) {
    const html = buildShippingLabel({ ...order, deliveryProvider: provider }, senders);
    assert.ok(html.includes(`${provider} Sender`));
    assert.ok(!html.includes(`${provider === "DTDC" ? "Postman" : "DTDC"} Sender`));
    assert.ok(html.includes("Customer Street"));
    assert.ok(!html.includes("Billing Only"));
    assert.ok(html.includes("PIN: 500001"));
  }
  assert.ok(buildShippingLabel(order, senders).includes("DTDC Sender"));
});

test("missing sender or recipient fields prevent incorrect labels", () => {
  assert.throws(() => buildShippingLabel(order, {}), /Save the DTDC sender address/);
  assert.throws(() => buildShippingLabel({ ...order, deliveryAddress: {} }, senders), /incomplete delivery address/);
});

test("label escapes customer and tracking text instead of executing HTML", () => {
  const html = buildShippingLabel({ ...order, deliveryAddress: { ...order.deliveryAddress, fullName: '<script>alert("x")</script>' }, trackingReference: "<img src=x onerror=alert(1)>" }, senders);
  assert.ok(!html.includes("<script>"));
  assert.ok(!html.includes("<img"));
  assert.ok(html.includes("&lt;script&gt;"));
  assert.ok(html.includes("@page{size:A4 portrait"));
});
