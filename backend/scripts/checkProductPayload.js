import "../config/env.js";
import mongoose from "mongoose";
import Product from "../models/Product.js";
import { createProductPreview } from "../utils/productPreview.js";

try {
  const start = performance.now();
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 8000 });
  const connected = performance.now();
  const [sizes] = await Product.aggregate([
    { $project: {
      fullBytes: { $bsonSize: "$$ROOT" },
      mediaBytes: { $add: [
        { $strLenBytes: { $ifNull: ["$video", ""] } },
        { $reduce: { input: { $ifNull: ["$images", []] }, initialValue: 0, in: { $add: ["$$value", { $strLenBytes: "$$this" }] } } },
      ] },
      coverBytes: { $strLenBytes: { $ifNull: [{ $arrayElemAt: ["$images", 0] }, ""] } },
    } },
    { $group: { _id: null, products: { $sum: 1 }, totalBytes: { $sum: "$fullBytes" }, allMediaBytes: { $sum: "$mediaBytes" }, coverBytes: { $sum: "$coverBytes" } } },
    { $project: { _id: 0 } },
  ]);
  const queryMs = Math.round(performance.now() - connected);
  const covers = await Product.find().select({ images: { $slice: 1 }, name: 1 }).lean();
  const previewsStarted = performance.now();
  let previewBytes = 0;
  for (const product of covers) previewBytes += Buffer.byteLength(await createProductPreview(product.images?.[0] || ""));
  const previewGenerationMs = Math.round(performance.now() - previewsStarted);
  const cachedStarted = performance.now();
  for (const product of covers) await createProductPreview(product.images?.[0] || "");
  console.log(JSON.stringify({ connectionMs: Math.round(connected - start), queryMs, ...sizes, previewBytes, previewGenerationMs, cachedPreviewMs: Math.round(performance.now() - cachedStarted) }));
} catch (error) {
  // Do not print database connection strings or hosts from connection errors.
  console.error(`Diagnostic failed: ${error.name}`);
  process.exitCode = 1;
} finally { await mongoose.disconnect(); }
