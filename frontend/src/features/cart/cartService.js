import api from "../../services/api.js";

const getCart = async () => {
  const response = await api.get("/cart");
  return response.data;
};

const addToCart = async (productId, quantity = 1, variantId = "") => {
  const response = await api.post(`/cart/${productId}`, { quantity, variantId });
  return response.data;
};

const updateCartItem = async (productId, quantity, variantId = "") => {
  const response = await api.put(`/cart/${productId}`, { quantity, variantId });
  return response.data;
};

const removeFromCart = async (productId, variantId = "") => {
  const response = await api.delete(`/cart/${productId}`, { data: { variantId } });
  return response.data;
};

const clearCart = async () => {
  const response = await api.delete("/cart");
  return response.data;
};

export default {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};
