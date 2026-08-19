import Product from "../models/Product.js";
import Wishlist from "../models/Wishlist.js";
import AppError from "../utils/appError.js";

export const getWishlistForUser = async (userId) => {
  let wishlist = await Wishlist.findOne({ user: userId }).populate("products");

  if (!wishlist) {
    wishlist = await Wishlist.create({ user: userId, products: [] });
  }

  return wishlist;
};

export const addProductToWishlist = async (userId, productId) => {
  const product = await Product.findById(productId);

  if (!product || !product.isActive) {
    throw new AppError("Product not found", 404);
  }

  const wishlist = await Wishlist.findOneAndUpdate(
    { user: userId },
    { $addToSet: { products: productId } },
    { new: true, upsert: true }
  ).populate("products");

  return wishlist;
};

export const removeProductFromWishlist = async (userId, productId) => {
  const wishlist = await Wishlist.findOneAndUpdate(
    { user: userId },
    { $pull: { products: productId } },
    { new: true, upsert: true }
  ).populate("products");

  return wishlist;
};
