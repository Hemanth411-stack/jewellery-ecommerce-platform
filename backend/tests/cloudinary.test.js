import assert from "node:assert/strict";
import test from "node:test";
import { Writable } from "node:stream";
import { v2 as cloudinary } from "cloudinary";
import jwt from "jsonwebtoken";
import app from "../app.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import { storeProductMedia, uploadProductMedia } from "../services/cloudinaryService.js";
import { updateProductById } from "../services/productService.js";
import { createProductPreview } from "../utils/productPreview.js";

const configure = (t) => {
  for (const key of ["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET", "JWT_SECRET"]) {
    const previous = process.env[key];
    process.env[key] = "test-only";
    t.after(() => { if (previous === undefined) delete process.env[key]; else process.env[key] = previous; });
  }
};
const mockUpload = (t, callback) => t.mock.method(cloudinary.uploader, "upload_stream", (options, done) => new Writable({
  write(chunk, encoding, next) { next(); },
  final(next) { callback(options, done); next(); },
}));

test("images upload as WebP, videos as video, and repeat uploads use the same ID", async (t) => {
  configure(t);
  const options = [];
  mockUpload(t, (settings, done) => { options.push(settings); done(null, { secure_url: `https://res.cloudinary.com/test/${settings.resource_type}/upload/test` }); });
  await uploadProductMedia(Buffer.from("image"), "image/jpeg");
  await uploadProductMedia(Buffer.from("image"), "image/jpeg");
  await uploadProductMedia(Buffer.from("video"), "video/mp4");
  assert.equal(options[0].format, "webp");
  assert.equal(options[0].quality, 90);
  assert.equal(options[0].overwrite, false);
  assert.equal(options[0].public_id, options[1].public_id);
  assert.equal(options[2].resource_type, "video");
  assert.equal(options[2].format, undefined);
});

test("legacy media becomes URLs in order, external URLs are not uploaded", async (t) => {
  configure(t);
  const upload = mockUpload(t, (settings, done) => done(null, { secure_url: `https://res.cloudinary.com/test/${settings.resource_type}/upload/test` }));
  const result = await storeProductMedia({ images: ["https://example.com/existing.jpg", "data:image/png;base64,aW1hZ2U="], video: "data:video/mp4;base64,dmlkZW8=" });
  assert.equal(upload.mock.callCount(), 2);
  assert.equal(result.images[0], "https://example.com/existing.jpg");
  assert.ok(result.images[1].startsWith("https://res.cloudinary.com/"));
  assert.ok(result.video.includes("/video/"));
  assert.match(await createProductPreview(result.images[1]), /c_limit,w_480,h_480,q_auto:good,f_webp/);
});

test("missing credentials, unsupported types and oversize files fail clearly", async (t) => {
  configure(t);
  delete process.env.CLOUDINARY_API_SECRET;
  await assert.rejects(uploadProductMedia(Buffer.from("image"), "image/png"), { statusCode: 503 });
  await assert.rejects(uploadProductMedia(Buffer.from("file"), "text/html"), { statusCode: 400 });
  await assert.rejects(uploadProductMedia(Buffer.alloc(10 * 1024 * 1024 + 1), "image/png"), { statusCode: 413 });
});

test("failed Cloudinary uploads do not overwrite the existing product", async (t) => {
  configure(t);
  mockUpload(t, (settings, done) => done(new Error("Sensitive upstream details")));
  t.mock.method(Product, "findById", async () => ({ slug: "ring", sku: "RING" }));
  t.mock.method(Product, "findOne", async () => null);
  const write = t.mock.method(Product, "findByIdAndUpdate", async () => {});
  await assert.rejects(updateProductById("ring", { name: "Ring", price: 1, stock: 1, images: ["data:image/png;base64,aW1hZ2U="] }), (error) => error.statusCode === 502 && !error.message.includes("Sensitive"));
  assert.equal(write.mock.callCount(), 0);
});

test("multipart endpoint accepts one file only for authenticated admins", async (t) => {
  configure(t);
  t.mock.method(User, "findById", async (id) => ({ _id: id, role: id === "admin" ? "admin" : "customer" }));
  mockUpload(t, (settings, done) => done(null, { secure_url: "https://res.cloudinary.com/test/image/upload/file.webp" }));
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  t.after(() => { server.closeAllConnections(); server.close(); });
  const url = `http://127.0.0.1:${server.address().port}/api/products/media`;
  for (const [role, status] of [[null, 401], ["customer", 403], ["admin", 201]]) {
    const form = new FormData();
    form.append("file", new Blob(["image"], { type: "image/png" }), "photo.png");
    const response = await fetch(url, { method: "POST", body: form, headers: role ? { Authorization: `Bearer ${jwt.sign({ id: role }, process.env.JWT_SECRET)}` } : {} });
    assert.equal(response.status, status, await response.text());
  }
});
