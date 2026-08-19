import api from "../../services/api.js";

const checkout = async (checkoutData) => {
  const response = await api.post("/orders/checkout", checkoutData);
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

export default {
  checkout,
  getMyOrders,
  getAdminOrders,
  updateOrderStatus,
};
