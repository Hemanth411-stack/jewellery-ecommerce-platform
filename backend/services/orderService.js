import { createHmac, timingSafeEqual } from "node:crypto";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import Review from "../models/Review.js";
import AppError from "../utils/appError.js";
import { getCartForUser } from "./cartService.js";

const calculateOrderItems = (cart) =>
  cart.items.map((item) => {
    const price = item.variant?.price ?? item.product.price;

    return {
      product: item.product._id,
      name: item.product.name,
      sku: item.product.sku,
      image: item.product.images?.[0] || "",
      variant: {
        color: item.variant?.color || "",
        size: item.variant?.size || "",
      },
      price,
      quantity: item.quantity,
      lineTotal: price * item.quantity,
    };
  });

const razorpayCredentials = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new AppError("Razorpay test keys are not configured on the server", 503);
  }
  return { keyId, keySecret };
};

const razorpayRequest = async (path, options = {}) => {
  const { keyId, keySecret } = razorpayCredentials();
  const response = await fetch(`https://api.razorpay.com/v1/${path}`, {
    ...options,
    headers: {
      Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new AppError(data.error?.description || "Razorpay request failed", 502);
  }
  return data;
};

export const createOnlineOrderFromCart = async ({ userId, billingAddress, deliveryAddress }) => {
  const cart = await getCartForUser(userId);
  if (!cart.items.length) throw new AppError("Cart is empty", 400);

  const items = calculateOrderItems(cart);
  const itemsTotal = items.reduce((total, item) => total + item.lineTotal, 0);
  const shippingFee = 0;
  const grandTotal = itemsTotal;
  const amount = Math.round(grandTotal * 100);
  if (!Number.isSafeInteger(amount) || amount <= 0) throw new AppError("Invalid order amount", 400);

  const order = new Order({
    user: userId, items, billingAddress, deliveryAddress,
    paymentMethod: "ONLINE", paymentStatus: "pending",
    checkoutCartUpdatedAt: cart.updatedAt,
    itemsTotal, shippingFee, grandTotal,
  });
  const razorpayOrder = await razorpayRequest("orders", {
    method: "POST",
    body: JSON.stringify({ amount, currency: "INR", receipt: order._id.toString() }),
  });
  order.razorpayOrderId = razorpayOrder.id;
  await order.save();
  return { orderId: order._id, razorpayOrderId: razorpayOrder.id, amount, currency: "INR", keyId: razorpayCredentials().keyId };
};

export const verifyOnlinePayment = async ({ userId, orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature }) => {
  const order = await Order.findOne({ _id: orderId, user: userId, paymentMethod: "ONLINE" });
  if (!order) throw new AppError("Order not found", 404);
  if (order.paymentStatus === "paid") {
    if (order.razorpayPaymentId === razorpayPaymentId) return order;
    throw new AppError("Order was already paid with another payment", 409);
  }
  if (!razorpayPaymentId || !razorpaySignature || order.razorpayOrderId !== razorpayOrderId) {
    throw new AppError("Invalid payment details", 400);
  }

  const expected = createHmac("sha256", razorpayCredentials().keySecret)
    .update(`${order.razorpayOrderId}|${razorpayPaymentId}`).digest();
  const supplied = Buffer.from(razorpaySignature, "hex");
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
    throw new AppError("Payment signature verification failed", 400);
  }

  const payment = await razorpayRequest(`payments/${encodeURIComponent(razorpayPaymentId)}`);
  if (payment.order_id !== order.razorpayOrderId || payment.amount !== Math.round(order.grandTotal * 100) || payment.currency !== "INR") {
    throw new AppError("Payment does not match the order", 400);
  }
  if (payment.status !== "captured") {
    throw new AppError("Payment is awaiting capture. Please retry verification shortly.", 409);
  }

  const paidOrder = await Order.findOneAndUpdate(
    { _id: order._id, paymentStatus: "pending" },
    { $set: { paymentStatus: "paid", razorpayPaymentId } },
    { new: true }
  );
  if (!paidOrder) return Order.findById(order._id);

  // Clear only the cart snapshot that was paid for; preserve later edits.
  await Cart.updateOne(
    { user: userId, updatedAt: order.checkoutCartUpdatedAt },
    { $set: { items: [] } }
  );
  return paidOrder;
};

export const getOrdersForUser = async (userId) => {
  const [orders, reviews] = await Promise.all([
    Order.find({ user: userId, $or: [{ paymentMethod: "COD" }, { paymentStatus: "paid" }] }).sort({ createdAt: -1 }).lean(),
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
  Order.find({ $or: [{ paymentMethod: "COD" }, { paymentStatus: "paid" }] })
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

export const updateOrderTrackingReference = async ({ orderId, trackingReference }) => {
  const normalizedReference = String(trackingReference || "").trim();

  if (!normalizedReference) {
    throw new AppError("DTDC reference number is required", 400);
  }

  if (normalizedReference.length > 100) {
    throw new AppError("DTDC reference number is too long", 400);
  }

  const order = await Order.findByIdAndUpdate(
    orderId,
    { trackingReference: normalizedReference },
    { new: true, runValidators: true }
  )
    .populate("user", "name email phone")
    .lean();

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  return order;
};
