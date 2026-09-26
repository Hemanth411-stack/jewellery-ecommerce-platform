import "../config/env.js";
import { v2 as cloudinary } from "cloudinary";
import { assertCloudinaryConfigured } from "../services/cloudinaryService.js";

try {
  assertCloudinaryConfigured();
  const result = await cloudinary.api.ping({ timeout: 15000 });
  console.log(JSON.stringify({ status: result.status }));
} catch (error) {
  const detail = error.error || error;
  const message = String(detail.message || "");
  let redactedMessage = message;
  for (const key of ["CLOUDINARY_API_SECRET", "CLOUDINARY_API_KEY", "CLOUDINARY_CLOUD_NAME"]) {
    const value = process.env[key]?.trim();
    if (value) redactedMessage = redactedMessage.split(value).join("[redacted]");
  }
  const reason = /disabled/i.test(message) ? "Cloudinary product environment is disabled"
    : /unknown.*cloud/i.test(message) ? "unknown cloud name"
      : /signature|api.key|authorization|unauthorized/i.test(message) ? "credentials rejected"
    : /cloud.name|cloud_name/i.test(message) ? "cloud name rejected"
      : /timeout|timed.out/i.test(message) ? "connection timed out"
        : /certificate|self.signed/i.test(message) ? "TLS certificate error" : "request failed";
  console.error(JSON.stringify({ status: "failed", httpCode: detail.http_code, code: detail.code, reason, message: redactedMessage }));
  process.exitCode = 1;
}
