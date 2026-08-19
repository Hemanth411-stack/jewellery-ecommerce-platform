import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Review from "../models/Review.js";
import AppError from "../utils/appError.js";

export const getReviewsByProduct = async (productId) => {
  const reviews = await Review.find({ product: productId }).sort({ createdAt: -1 });
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((total, review) => total + review.rating, 0) / reviews.length
      : 0;

  return {
    reviews,
    averageRating: Number(averageRating.toFixed(1)),
    totalReviews: reviews.length,
  };
};

export const createProductReview = async ({ productId, user, rating, title, comment }) => {
  const product = await Product.findById(productId);

  if (!product || !product.isActive) {
    throw new AppError("Product not found", 404);
  }

  const deliveredOrder = await Order.findOne({
    user: user._id,
    status: "delivered",
    "items.product": productId,
  });

  if (!deliveredOrder) {
    throw new AppError("You can review this product only after the order is delivered", 403);
  }

  const existingReview = await Review.findOne({ product: productId, user: user._id });

  if (existingReview) {
    throw new AppError("You have already reviewed this product", 409);
  }

  return Review.create({
    product: productId,
    user: user._id,
    name: user.name,
    rating,
    title,
    comment,
  });
};
