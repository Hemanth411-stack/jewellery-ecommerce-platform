import Product from "../models/Product.js";
import Wishlist from "../models/Wishlist.js";
import AppError from "../utils/appError.js";

const wishlistProducts = { path: "products", select: {
  name: 1, sku: 1, category: 1, description: 1, price: 1, compareAtPrice: 1,
  stock: 1, variants: 1, isActive: 1, isFeatured: 1, images: { $slice: 1 },
} };

export const getWishlistForUser = async (userId) => {
  let wishlist = await Wishlist.findOne({ user: userId }).populate(wishlistProducts);

  if (!wishlist) {
    wishlist = await Wishlist.create({ user: userId, products: [] });
  }

  return wishlist;
};

export const addProductToWishlist = async (userId, productId) => {
  const product = await Product.findById(productId).select("isActive");

  if (!product || !product.isActive) {
    throw new AppError("Product not found", 404);
  }

  const wishlist = await Wishlist.findOneAndUpdate(
    { user: userId },
    { $addToSet: { products: productId } },
    { new: true, upsert: true }
  ).populate(wishlistProducts);

  return wishlist;
};

export const removeProductFromWishlist = async (userId, productId) => {
  const wishlist = await Wishlist.findOneAndUpdate(
    { user: userId },
    { $pull: { products: productId } },
    { new: true, upsert: true }
  ).populate(wishlistProducts);

  return wishlist;
};
