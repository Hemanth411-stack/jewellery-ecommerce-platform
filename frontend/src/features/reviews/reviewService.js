import api from "../../services/api.js";

const getProductReviews = async (productId) => {
  const response = await api.get(`/reviews/product/${productId}`);
  return response.data;
};

const createReview = async (productId, reviewData) => {
  const response = await api.post(`/reviews/product/${productId}`, reviewData);
  return response.data;
};

export default {
  getProductReviews,
  createReview,
};
