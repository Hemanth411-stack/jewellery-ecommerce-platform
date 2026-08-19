import Product from "../models/Product.js";
import AppError from "../utils/appError.js";

const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const normalizeTags = (tags) => {
  if (Array.isArray(tags)) {
    return tags.map((tag) => String(tag).trim()).filter(Boolean);
  }

  if (typeof tags === "string") {
    return tags.split(",").map((tag) => tag.trim()).filter(Boolean);
  }

  return [];
};

const normalizeImages = (images) => {
  if (Array.isArray(images)) {
    return images.map((image) => String(image).trim()).filter(Boolean);
  }

  if (typeof images === "string" && images.trim()) {
    return [images.trim()];
  }

  return [];
};

const prepareProductPayload = (payload) => ({
  ...payload,
  slug: payload.slug ? slugify(payload.slug) : slugify(payload.name),
  sku: payload.sku?.trim().toUpperCase(),
  tags: normalizeTags(payload.tags),
  images: normalizeImages(payload.images),
});

export const createProduct = async (payload) => {
  const productPayload = prepareProductPayload(payload);

  const duplicateProduct = await Product.findOne({
    $or: [{ sku: productPayload.sku }, { slug: productPayload.slug }],
  });

  if (duplicateProduct) {
    throw new AppError("Product with this SKU or slug already exists", 409);
  }

  return Product.create(productPayload);
};

export const updateProductById = async (productId, payload) => {
  const productPayload = prepareProductPayload(payload);

  const duplicateProduct = await Product.findOne({
    _id: { $ne: productId },
    $or: [{ sku: productPayload.sku }, { slug: productPayload.slug }],
  });

  if (duplicateProduct) {
    throw new AppError("Product with this SKU or slug already exists", 409);
  }

  const product = await Product.findByIdAndUpdate(productId, productPayload, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  return product;
};

export const getProducts = async ({ includeInactive = false, featured } = {}) => {
  const filter = includeInactive ? {} : { isActive: true };

  if (featured !== undefined) {
    filter.isFeatured = featured;
  }

  return Product.find(filter).sort({ createdAt: -1 });
};

export const getProductById = async (productId) => {
  const product = await Product.findById(productId);

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  return product;
};

export const getRelatedProducts = async (productId, limit = 4) => {
  const product = await getProductById(productId);

  return Product.find({
    _id: { $ne: productId },
    isActive: true,
    $or: [
      { category: product.category },
      { metal: product.metal },
      { gemstone: product.gemstone },
    ],
  })
    .limit(limit)
    .sort({ isFeatured: -1, createdAt: -1 });
};

export const deleteProductById = async (productId) => {
  const product = await Product.findByIdAndDelete(productId);

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  return product;
};
