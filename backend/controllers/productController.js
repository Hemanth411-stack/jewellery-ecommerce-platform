import {
  createProduct,
  deleteProductById,
  getProductById,
  getProducts,
  getRelatedProducts,
  updateProductById,
} from "../services/productService.js";
import AppError from "../utils/appError.js";

const hasValue = (value) => value !== undefined && value !== null && String(value).trim() !== "";

const validateProductPayload = (payload) => {
  const requiredFields = ["name", "category", "description"];
  const missingField = requiredFields.find((field) => !hasValue(payload[field]));

  if (missingField) {
    throw new AppError(`${missingField} is required`, 400);
  }

  if (payload.variants !== undefined && !Array.isArray(payload.variants)) {
    throw new AppError("Options must be a list", 400);
  }

  if (payload.variants?.length) {
    for (const option of payload.variants) {
      if (!option || (!hasValue(option.color) && !hasValue(option.size))) {
        throw new AppError("Each option needs a color or size", 400);
      }
      if (!hasValue(option.price) || !Number.isFinite(Number(option.price)) || Number(option.price) < 0 ||
          !hasValue(option.stock) || !Number.isInteger(Number(option.stock)) || Number(option.stock) < 0) {
        throw new AppError("Each option needs a valid price and stock", 400);
      }
    }
  } else if (!hasValue(payload.price) || !Number.isFinite(Number(payload.price)) || Number(payload.price) < 0 ||
             !hasValue(payload.stock) || !Number.isInteger(Number(payload.stock)) || Number(payload.stock) < 0) {
    throw new AppError("Price and stock are required when there are no options", 400);
  }

  if (hasValue(payload.compareAtPrice) && (!Number.isFinite(Number(payload.compareAtPrice)) || Number(payload.compareAtPrice) < 0)) {
    throw new AppError("Compare price must be a valid amount", 400);
  }
};

export const listProducts = async (req, res, next) => {
  try {
    const includeInactive = req.user?.role === "admin" && req.query.includeInactive === "true";
    const featured = req.query.featured === undefined ? undefined : req.query.featured === "true";
    const products = await getProducts({ includeInactive, featured });

    res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      products,
    });
  } catch (error) {
    next(error);
  }
};

export const createProductHandler = async (req, res, next) => {
  try {
    validateProductPayload(req.body);

    const product = await createProduct(req.body);

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProductHandler = async (req, res, next) => {
  try {
    validateProductPayload(req.body);

    const product = await updateProductById(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    next(error);
  }
};

export const getProductHandler = async (req, res, next) => {
  try {
    const product = await getProductById(req.params.id);

    res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      product,
    });
  } catch (error) {
    next(error);
  }
};

export const getRelatedProductsHandler = async (req, res, next) => {
  try {
    const products = await getRelatedProducts(req.params.id);

    res.status(200).json({
      success: true,
      message: "Related products fetched successfully",
      products,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProductHandler = async (req, res, next) => {
  try {
    await deleteProductById(req.params.id);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
