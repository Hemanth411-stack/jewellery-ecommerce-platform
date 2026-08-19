import api from "../../services/api.js";

const getProducts = async (params = {}) => {
  const response = await api.get("/products", { params });
  return response.data;
};

const getProductById = async (productId) => {
  const response = await api.get(`/products/${productId}`);
  return response.data;
};

const getRelatedProducts = async (productId) => {
  const response = await api.get(`/products/${productId}/related`);
  return response.data;
};

const createProduct = async (productData) => {
  const response = await api.post("/products", productData);
  return response.data;
};

const updateProduct = async (productId, productData) => {
  const response = await api.put(`/products/${productId}`, productData);
  return response.data;
};

const deleteProduct = async (productId) => {
  const response = await api.delete(`/products/${productId}`);
  return response.data;
};

export default {
  getProducts,
  getProductById,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};
