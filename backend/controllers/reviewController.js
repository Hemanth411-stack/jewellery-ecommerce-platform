import {
  createProductReview,
  getReviewsByProduct,
} from "../services/reviewService.js";
import AppError from "../utils/appError.js";

export const listProductReviews = async (req, res, next) => {
  try {
    const reviewSummary = await getReviewsByProduct(req.params.productId);

    res.status(200).json({
      success: true,
      message: "Reviews fetched successfully",
      ...reviewSummary,
    });
  } catch (error) {
    next(error);
  }
};

export const createReview = async (req, res, next) => {
  try {
    const { rating, title, comment } = req.body;

    if (!rating || Number(rating) < 1 || Number(rating) > 5) {
      throw new AppError("Rating must be between 1 and 5", 400);
    }

    if (!comment?.trim()) {
      throw new AppError("Review comment is required", 400);
    }

    const review = await createProductReview({
      productId: req.params.productId,
      user: req.user,
      rating: Number(rating),
      title,
      comment,
    });

    res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      review,
    });
  } catch (error) {
    next(error);
  }
};
