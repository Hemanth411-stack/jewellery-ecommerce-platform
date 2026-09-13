import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import AppError from "../utils/appError.js";

const populateCart = (query) =>
  query.populate("items.product");

const findProductVariant = (product, variantId) => {
  if (!variantId) return null;

  return product.variants?.find((variant) => variant._id.toString() === variantId);
};

const isSameCartItem = (item, productId, variantId = "") =>
  item.product._id.toString() === productId && (item.variantId || "") === variantId;

export const getCartForUser = async (userId) => {
  let cart = await populateCart(Cart.findOne({ user: userId }));

  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
    cart = await populateCart(Cart.findById(cart._id));
  }

  return cart;
};

export const addItemToCart = async (userId, productId, quantity = 1, variantId = "") => {
  const product = await Product.findById(productId);

  if (!product || !product.isActive) {
    throw new AppError("Product not found", 404);
  }

  const selectedVariant = findProductVariant(product, variantId);
  if (product.variants?.length && !variantId) {
    throw new AppError("Choose a color or size before adding this product", 400);
  }

  if (variantId && !selectedVariant) {
    throw new AppError("Selected product option is not available", 400);
  }

  const availableStock = selectedVariant ? selectedVariant.stock : product.stock;

  if (availableStock < quantity) {
    throw new AppError("Requested quantity is not available", 400);
  }

  const cart = await getCartForUser(userId);
  const cartItem = cart.items.find((item) => isSameCartItem(item, productId, variantId));

  if (cartItem) {
    if (availableStock < cartItem.quantity + quantity) {
      throw new AppError("Requested quantity is not available", 400);
    }

    cartItem.quantity += quantity;
  } else {
    cart.items.push({
      product: productId,
      variantId,
      variant: selectedVariant
        ? {
            color: selectedVariant.color,
            size: selectedVariant.size,
            price: selectedVariant.price,
          }
        : undefined,
      quantity,
    });
  }

  await cart.save();
  return getCartForUser(userId);
};

export const updateCartItemQuantity = async (userId, productId, quantity, variantId = "") => {
  if (quantity < 1) {
    throw new AppError("Quantity must be at least 1", 400);
  }

  const cart = await getCartForUser(userId);
  const cartItem = cart.items.find((item) => isSameCartItem(item, productId, variantId));

  if (!cartItem) {
    throw new AppError("Cart item not found", 404);
  }

  const selectedVariant = findProductVariant(cartItem.product, variantId);
  const availableStock = selectedVariant ? selectedVariant.stock : cartItem.product.stock;

  if (availableStock < quantity) {
    throw new AppError("Requested quantity is not available", 400);
  }

  cartItem.quantity = quantity;
  await cart.save();

  return getCartForUser(userId);
};

export const removeItemFromCart = async (userId, productId, variantId = "") => {
  const cart = await getCartForUser(userId);
  cart.items = cart.items.filter((item) => !isSameCartItem(item, productId, variantId));
  await cart.save();

  return getCartForUser(userId);
};

export const clearCartForUser = async (userId) => {
  const cart = await getCartForUser(userId);
  cart.items = [];
  await cart.save();

  return cart;
};
