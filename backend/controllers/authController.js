import {
  createUser,
  formatUserResponse,
  validateUserCredentials,
} from "../services/authService.js";
import AppError from "../utils/appError.js";
import generateToken from "../utils/generateToken.js";

const required = (value) => value !== undefined && value !== null && String(value).trim() !== "";

export const registerUser = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;

    if (![name, email, phone, password].every(required)) {
      throw new AppError("Name, email, phone, and password are required", 400);
    }

    if (password.length < 6) {
      throw new AppError("Password must be at least 6 characters", 400);
    }

    const user = await createUser({ name, email, phone, password });
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      user,
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (![email, password].every(required)) {
      throw new AppError("Email and password are required", 400);
    }

    const user = await validateUserCredentials(email, password);
    const token = generateToken(user.id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      user,
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Current user fetched successfully",
    user: formatUserResponse(req.user),
  });
};
