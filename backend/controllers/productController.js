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
  const requiredFields = ["name", "sku", "category", "description", "price", "stock", "metal"];
  const missingField = requiredFields.find((field) => !hasValue(payload[field]));

  if (missingField) {
    throw new AppError(`${missingField} is required`, 400);
  }

  if (Number(payload.price) < 0 || Number(payload.stock) < 0) {
    throw new AppError("Price and stock must be positive values", 400);
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
