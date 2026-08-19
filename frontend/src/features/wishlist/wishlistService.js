import api from "../../services/api.js";

const getWishlist = async () => {
  const response = await api.get("/wishlist");
  return response.data;
};

const addToWishlist = async (productId) => {
  const response = await api.post(`/wishlist/${productId}`);
  return response.data;
};

const removeFromWishlist = async (productId) => {
  const response = await api.delete(`/wishlist/${productId}`);
  return response.data;
};

export default {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};
