import mongoose from "mongoose";
import AppError from "./appError.js";

// Leave room for generated fields, timestamps and the MongoDB update envelope.
const MAX_PRODUCT_BYTES = 15 * 1024 * 1024;

export const validateProductSize = (payload, existingProduct) => {
  const existing = existingProduct?.toObject ? existingProduct.toObject() : existingProduct || {};
  const bytes = mongoose.mongo.BSON.calculateObjectSize({ ...existing, ...payload });
  if (bytes > MAX_PRODUCT_BYTES) {
    throw new AppError(
      "Product images and video are too large to save together. Use smaller images or a video URL, then try again. Your existing product has not been changed.",
      413
    );
  }
};
