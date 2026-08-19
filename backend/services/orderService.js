import Order from "../models/Order.js";
import Review from "../models/Review.js";
import AppError from "../utils/appError.js";
import { clearCartForUser, getCartForUser } from "./cartService.js";

const calculateOrderItems = (cart) =>
  cart.items.map((item) => ({
    product: item.product._id,
    name: item.product.name,
    sku: item.product.sku,
    image: item.product.images?.[0] || "",
    price: item.product.price,
    quantity: item.quantity,
    lineTotal: item.product.price * item.quantity,
  }));

export const createOrderFromCart = async ({ userId, billingAddress, deliveryAddress, paymentMethod }) => {
  const cart = await getCartForUser(userId);

  if (!cart.items.length) {
    throw new AppError("Cart is empty", 400);
  }

  const items = calculateOrderItems(cart);
  const itemsTotal = items.reduce((total, item) => total + item.lineTotal, 0);
  const shippingFee = itemsTotal >= 999 ? 0 : 99;
  const grandTotal = itemsTotal + shippingFee;

  const order = await Order.create({
    user: userId,
    items,
    billingAddress,
    deliveryAddress,
    paymentMethod,
    itemsTotal,
    shippingFee,
    grandTotal,
  });

  await clearCartForUser(userId);

  return order;
};

export const getOrdersForUser = async (userId) => {
  const [orders, reviews] = await Promise.all([
    Order.find({ user: userId }).sort({ createdAt: -1 }).lean(),
    Review.find({ user: userId }).select("product").lean(),
  ]);
  const reviewedProductIds = new Set(reviews.map((review) => review.product.toString()));

  return orders.map((order) => ({
    ...order,
    items: order.items.map((item) => {
      const productId = item.product.toString();
      const hasReviewed = reviewedProductIds.has(productId);

      return {
        ...item,
        hasReviewed,
        canReview: order.status === "delivered" && !hasReviewed,
      };
    }),
  }));
};

export const getAllOrders = async () =>
  Order.find({})
    .populate("user", "name email phone")
    .sort({ createdAt: -1 })
    .lean();

export const updateOrderStatus = async ({ orderId, status }) => {
  const allowedStatuses = ["placed", "confirmed", "packed", "shipped", "delivered", "cancelled"];

  if (!allowedStatuses.includes(status)) {
    throw new AppError("Invalid order status", 400);
  }

  const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true, runValidators: true })
    .populate("user", "name email phone")
    .lean();

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  return order;
};
