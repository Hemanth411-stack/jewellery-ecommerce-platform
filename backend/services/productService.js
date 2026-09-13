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
    return images.map((image) => String(image).trim()).filter(Boolean).slice(0, 5);
  }

  if (typeof images === "string" && images.trim()) {
    return [images.trim()];
  }

  return [];
};

const normalizeVariants = (variants) => {
  if (!Array.isArray(variants)) return [];

  return variants
    .map((variant) => ({
      color: String(variant.color || "").trim(),
      size: String(variant.size || "").trim(),
      price: Number(variant.price),
      stock: Number(variant.stock) || 0,
    }))
    .filter((variant) => (variant.color || variant.size) && Number.isFinite(variant.price) && variant.price >= 0);
};

const generateSku = (payload) => {
  const categoryPrefix = String(payload.category || "product")
    .replace(/[^a-z0-9]/gi, "")
    .slice(0, 3)
    .toUpperCase()
    .padEnd(3, "P");
  const uniqueSuffix = Date.now().toString(36).toUpperCase();

  return `HP-${categoryPrefix}-${uniqueSuffix}`;
};

const prepareProductPayload = (payload, existingProduct = null) => {
  const variants = normalizeVariants(payload.variants);
  return {
    ...payload,
    slug: payload.slug ? slugify(payload.slug) : existingProduct?.slug || slugify(payload.name),
    sku: payload.sku?.trim().toUpperCase() || existingProduct?.sku || generateSku(payload),
    tags: normalizeTags(payload.tags),
    images: normalizeImages(payload.images),
    video: String(payload.video || "").trim(),
    youtubeUrl: String(payload.youtubeUrl || "").trim(),
    variants,
    price: variants.length ? Math.min(...variants.map((option) => option.price)) : Number(payload.price),
    stock: variants.length ? variants.reduce((total, option) => total + option.stock, 0) : Number(payload.stock),
    compareAtPrice: variants.length ? 0 : Number(payload.compareAtPrice) || 0,
  };
};

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
  const existingProduct = await Product.findById(productId);

  if (!existingProduct) {
    throw new AppError("Product not found", 404);
  }

  const productPayload = prepareProductPayload(payload, existingProduct);

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
  const relatedConditions = [
    { category: product.category },
    product.gemstone ? { gemstone: product.gemstone } : null,
  ].filter(Boolean);

  return Product.find({
    _id: { $ne: productId },
    isActive: true,
    $or: relatedConditions,
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
