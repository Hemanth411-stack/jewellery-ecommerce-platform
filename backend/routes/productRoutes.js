import express from "express";
import {
  createProductHandler,
  deleteProductHandler,
  getProductHandler,
  getRelatedProductsHandler,
  listProducts,
  updateProductHandler,
} from "../controllers/productController.js";
import { adminOnly, optionalAuth, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", optionalAuth, listProducts);
router.get("/:id/related", getRelatedProductsHandler);
router.get("/:id", getProductHandler);
router.post("/", protect, adminOnly, createProductHandler);
router.put("/:id", protect, adminOnly, updateProductHandler);
router.delete("/:id", protect, adminOnly, deleteProductHandler);

export default router;
