import express from "express";
import {
  createReview,
  listProductReviews,
} from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/product/:productId", listProductReviews);
router.post("/product/:productId", protect, createReview);

export default router;
