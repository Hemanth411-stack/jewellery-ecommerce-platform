import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import AppError from "../utils/appError.js";

const populateCart = (query) =>
  query.populate("items.product");

export const getCartForUser = async (userId) => {
  let cart = await populateCart(Cart.findOne({ user: userId }));

  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
    cart = await populateCart(Cart.findById(cart._id));
  }

  return cart;
};

export const addItemToCart = async (userId, productId, quantity = 1) => {
  const product = await Product.findById(productId);

  if (!product || !product.isActive) {
    throw new AppError("Product not found", 404);
  }

  if (product.stock < quantity) {
    throw new AppError("Requested quantity is not available", 400);
  }

  const cart = await getCartForUser(userId);
  const cartItem = cart.items.find((item) => item.product._id.toString() === productId);

  if (cartItem) {
    cartItem.quantity += quantity;
  } else {
    cart.items.push({ product: productId, quantity });
  }

  await cart.save();
  return getCartForUser(userId);
};

export const updateCartItemQuantity = async (userId, productId, quantity) => {
  if (quantity < 1) {
    throw new AppError("Quantity must be at least 1", 400);
  }

  const cart = await getCartForUser(userId);
  const cartItem = cart.items.find((item) => item.product._id.toString() === productId);

  if (!cartItem) {
    throw new AppError("Cart item not found", 404);
  }

  cartItem.quantity = quantity;
  await cart.save();

  return getCartForUser(userId);
};

export const removeItemFromCart = async (userId, productId) => {
  const cart = await getCartForUser(userId);
  cart.items = cart.items.filter((item) => item.product._id.toString() !== productId);
  await cart.save();

  return getCartForUser(userId);
};

export const clearCartForUser = async (userId) => {
  const cart = await getCartForUser(userId);
  cart.items = [];
  await cart.save();

  return cart;
};
