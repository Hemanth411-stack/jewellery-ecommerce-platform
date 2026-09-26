import assert from "node:assert/strict";
import test from "node:test";
import SenderAddress from "../models/SenderAddress.js";
import { getSenderAddresses, saveSenderAddress } from "../controllers/senderAddressController.js";
import { adminOnly } from "../middleware/authMiddleware.js";

const address = { fullName: " Shop ", phone: "1234567890", addressLine1: "Street", city: "City", state: "State", postalCode: "500001", country: "India" };
const response = () => ({ json(body) { this.body = body; } });

test("sender addresses are saved independently and exclude unexpected fields", async (t) => {
  const saved = {};
  t.mock.method(SenderAddress, "findByIdAndUpdate", async (id, update, options) => {
    assert.equal(options.upsert, true);
    saved[id] = { _id: id, ...update.$set };
    return saved[id];
  });
  for (const provider of ["DTDC", "Postman"]) {
    const res = response();
    await saveSenderAddress({ params: { provider }, body: { ...address, fullName: ` ${provider} Shop `, _id: "override" } }, res, (error) => { throw error; });
    assert.equal(res.body.address._id, provider);
    assert.equal(res.body.address.fullName, `${provider} Shop`);
  }
  t.mock.method(SenderAddress, "find", () => ({ lean: async () => Object.values(saved) }));
  const res = response();
  await getSenderAddresses({}, res, (error) => { throw error; });
  assert.equal(res.body.addresses.length, 2);
});

test("invalid providers and incomplete addresses are rejected without writing", async (t) => {
  const write = t.mock.method(SenderAddress, "findByIdAndUpdate", async () => {});
  for (const [provider, body] of [["Other", address], ["DTDC", {}], ["DTDC", { ...address, fullName: " " }]]) {
    let caught;
    await saveSenderAddress({ params: { provider }, body }, response(), (error) => { caught = error; });
    assert.equal(caught.statusCode, 400);
  }
  assert.equal(write.mock.callCount(), 0);
});

test("sender address admin guard rejects customer accounts", () => {
  let caught;
  adminOnly({ user: { role: "user" } }, {}, (error) => { caught = error; });
  assert.equal(caught.statusCode, 403);
});
