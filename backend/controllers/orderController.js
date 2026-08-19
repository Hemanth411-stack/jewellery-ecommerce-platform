import {
  createOrderFromCart,
  getAllOrders,
  getOrdersForUser,
  updateOrderStatus,
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

export const checkout = async (req, res, next) => {
  try {
    const { billingAddress, deliveryAddress, paymentMethod = "COD" } = req.body;

    validateAddress(billingAddress, "Billing");
    validateAddress(deliveryAddress, "Delivery");

    const order = await createOrderFromCart({
      userId: req.user._id,
      billingAddress,
      deliveryAddress,
      paymentMethod,
    });

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });
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
