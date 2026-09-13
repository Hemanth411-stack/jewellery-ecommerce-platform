import bcrypt from "bcryptjs";
import User from "../models/User.js";
import AppError from "../utils/appError.js";

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export const findUserByEmail = async (email, includePassword = false) => {
  const query = User.findOne({ email: email.toLowerCase() });
  return includePassword ? query.select("+password") : query;
};

export const createUser = async ({ name, email, phone, password }) => {
  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    throw new AppError("Email is already registered", 409);
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email,
    phone,
    password: hashedPassword,
  });

  return sanitizeUser(user);
};

export const validateUserCredentials = async (email, password) => {
  const user = await findUserByEmail(email, true);

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const passwordMatches = await bcrypt.compare(password, user.password);

  if (!passwordMatches) {
    throw new AppError("Invalid email or password", 401);
  }

  return sanitizeUser(user);
};

export const updateUserProfile = async (userId, { name, email, phone }) => {
  const normalizedEmail = email.toLowerCase().trim();
  const existingUser = await User.findOne({ email: normalizedEmail, _id: { $ne: userId } });

  if (existingUser) {
    throw new AppError("Email is already registered", 409);
  }

  const user = await User.findByIdAndUpdate(
    userId,
    {
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
    },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return sanitizeUser(user);
};

export const formatUserResponse = sanitizeUser;
