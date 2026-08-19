import {
  addItemToCart,
  clearCartForUser,
  getCartForUser,
  removeItemFromCart,
  updateCartItemQuantity,
} from "../services/cartService.js";

export const getCart = async (req, res, next) => {
  try {
    const cart = await getCartForUser(req.user._id);

    res.status(200).json({
      success: true,
      message: "Cart fetched successfully",
      cart,
    });
  } catch (error) {
    next(error);
  }
};

export const addToCart = async (req, res, next) => {
  try {
    const cart = await addItemToCart(req.user._id, req.params.productId, Number(req.body.quantity) || 1);

    res.status(200).json({
      success: true,
      message: "Product added to cart",
      cart,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCartItem = async (req, res, next) => {
  try {
    const cart = await updateCartItemQuantity(req.user._id, req.params.productId, Number(req.body.quantity));

    res.status(200).json({
      success: true,
      message: "Cart updated successfully",
      cart,
    });
  } catch (error) {
    next(error);
  }
};

export const removeFromCart = async (req, res, next) => {
  try {
    const cart = await removeItemFromCart(req.user._id, req.params.productId);

    res.status(200).json({
      success: true,
      message: "Product removed from cart",
      cart,
    });
  } catch (error) {
    next(error);
  }
};

export const clearCart = async (req, res, next) => {
  try {
    const cart = await clearCartForUser(req.user._id);

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      cart,
    });
  } catch (error) {
    next(error);
  }
};
