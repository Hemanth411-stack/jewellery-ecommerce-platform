import api from "../../services/api.js";

const register = async (userData) => {
  const response = await api.post("/auth/register", userData);
  return response.data;
};

const login = async (credentials) => {
  const response = await api.post("/auth/login", credentials);
  return response.data;
};

const requestPasswordReset = async (email) => {
  const response = await api.post("/auth/forgot-password", { email });
  return response.data;
};

const resetPassword = async (data) => {
  const response = await api.post("/auth/reset-password", data);
  return response.data;
};

const getCurrentUser = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

const updateCurrentUser = async (userData) => {
  const response = await api.put("/auth/me", userData);
  return response.data;
};

const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export default {
  register,
  login,
  requestPasswordReset,
  resetPassword,
  getCurrentUser,
  updateCurrentUser,
  logout,
};
