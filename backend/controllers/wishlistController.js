import {
  addProductToWishlist,
  getWishlistForUser,
  removeProductFromWishlist,
} from "../services/wishlistService.js";
import { wishlistResponse } from "../utils/productPreview.js";

export const getWishlist = async (req, res, next) => {
  try {
    const wishlist = await getWishlistForUser(req.user._id);

    res.status(200).json({
      success: true,
      message: "Wishlist fetched successfully",
      wishlist: await wishlistResponse(wishlist),
    });
  } catch (error) {
    next(error);
  }
};

export const addToWishlist = async (req, res, next) => {
  try {
    const wishlist = await addProductToWishlist(req.user._id, req.params.productId);

    res.status(200).json({
      success: true,
      message: "Product added to wishlist",
      wishlist: await wishlistResponse(wishlist),
    });
  } catch (error) {
    next(error);
  }
};

export const removeFromWishlist = async (req, res, next) => {
  try {
    const wishlist = await removeProductFromWishlist(req.user._id, req.params.productId);

    res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
      wishlist: await wishlistResponse(wishlist),
    });
  } catch (error) {
    next(error);
  }
};
