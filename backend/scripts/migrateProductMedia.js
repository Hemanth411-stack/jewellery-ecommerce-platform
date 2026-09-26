import "../config/env.js";
import mongoose from "mongoose";
import Product from "../models/Product.js";
import { assertCloudinaryConfigured, storeProductMedia } from "../services/cloudinaryService.js";

const apply = process.argv.includes("--apply");
try {
  if (apply) assertCloudinaryConfigured();
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
  const cursor = Product.find({ $or: [{ images: /^data:/ }, { video: /^data:/ }] }).select("images video updatedAt").lean().cursor();
  let found = 0;
  let migrated = 0;
  let skipped = 0;
  for await (const product of cursor) {
    found++;
    if (!apply) continue;
    const media = await storeProductMedia(product);
    // Do not overwrite an admin edit that happened during the upload.
    const result = await Product.updateOne({ _id: product._id, updatedAt: product.updatedAt }, { $set: media }, { runValidators: true });
    if (result.modifiedCount) migrated++;
    else skipped++;
    console.log(`Migrated ${migrated}; skipped concurrent edits ${skipped}.`);
  }
  console.log(apply ? `Finished: ${migrated} migrated, ${skipped} skipped.` : `${found} products contain embedded media. Run npm run media:migrate -- --apply to upload and replace it with Cloudinary URLs.`);
} catch (error) {
  console.error(error.statusCode ? error.message : `Migration failed (${error.name}). Successfully migrated products remain usable; rerun to continue.`);
  process.exitCode = 1;
} finally { await mongoose.disconnect(); }
