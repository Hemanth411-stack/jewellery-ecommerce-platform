import {
  createOnlineOrderFromCart,
  getAllOrders,
  getOrdersForUser,
  updateOrderTrackingReference,
  updateOrderStatus,
  verifyOnlinePayment,
} from "../services/orderService.js";
import AppError from "../utils/appError.js";

const requiredAddressFields = ["fullName", "phone", "addressLine1", "city", "state", "postalCode", "country"];

const validateAddress = (address, label) => {
  if (!address) {
    throw new AppError(`${label} address is required`, 400);
  }

  const missingField = requiredAddressFields.find((field) => !String(address[field] || "").trim());

  if (missingField) {
    throw new AppError(`${label} address ${missingField} is required`, 400);
  }
};

export const startOnlineCheckout = async (req, res, next) => {
  try {
    const { billingAddress, deliveryAddress } = req.body;
    validateAddress(billingAddress, "Billing");
    validateAddress(deliveryAddress, "Delivery");
    const payment = await createOnlineOrderFromCart({
      userId: req.user._id, billingAddress, deliveryAddress,
    });
    res.status(201).json({ success: true, payment });
  } catch (error) {
    next(error);
  }
};

export const confirmOnlinePayment = async (req, res, next) => {
  try {
    const order = await verifyOnlinePayment({
      userId: req.user._id,
      orderId: req.params.orderId,
      razorpayOrderId: req.body.razorpay_order_id,
      razorpayPaymentId: req.body.razorpay_payment_id,
      razorpaySignature: req.body.razorpay_signature,
    });
    res.json({ success: true, message: "Payment verified and order placed successfully", order });
  } catch (error) {
    next(error);
  }
};

export const listMyOrders = async (req, res, next) => {
  try {
    const orders = await getOrdersForUser(req.user._id);

    res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      orders,
    });
  } catch (error) {
    next(error);
  }
};

export const listAllOrders = async (req, res, next) => {
  try {
    const orders = await getAllOrders();

    res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      orders,
    });
  } catch (error) {
    next(error);
  }
};

export const changeOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const order = await updateOrderStatus({
      orderId: req.params.orderId,
      status,
    });

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    next(error);
  }
};

export const changeOrderTrackingReference = async (req, res, next) => {
  try {
    const order = await updateOrderTrackingReference({
      orderId: req.params.orderId,
      trackingReference: req.body.trackingReference,
    });

    res.status(200).json({
      success: true,
      message: "DTDC reference number saved successfully",
      order,
    });
  } catch (error) {
    next(error);
  }
};
