import api from "../../services/api.js";

const startOnlineCheckout = async (checkoutData) => {
  const response = await api.post("/orders/online-checkout", checkoutData);
  return response.data;
};

const verifyOnlinePayment = async (orderId, paymentResponse) => {
  const response = await api.post(`/orders/${orderId}/verify-payment`, paymentResponse);
  return response.data;
};

const getMyOrders = async () => {
  const response = await api.get("/orders/my-orders");
  return response.data;
};

const getAdminOrders = async () => {
  const response = await api.get("/orders/admin");
  return response.data;
};

const updateOrderStatus = async (orderId, status) => {
  const response = await api.patch(`/orders/admin/${orderId}/status`, { status });
  return response.data;
};

const updateTrackingReference = async (orderId, trackingReference) => {
  const response = await api.patch(`/orders/admin/${orderId}/tracking`, { trackingReference });
  return response.data;
};

export default {
  startOnlineCheckout,
  verifyOnlinePayment,
  getMyOrders,
  getAdminOrders,
  updateOrderStatus,
  updateTrackingReference,
};
