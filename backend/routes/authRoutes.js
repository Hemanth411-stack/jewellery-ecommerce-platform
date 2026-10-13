import express from "express";
import {
  getCurrentUser,
  loginUser,
  registerUser,
  updateCurrentUser,
  requestPasswordReset,
  resetPassword,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", requestPasswordReset);
router.post("/reset-password", resetPassword);
router.get("/me", protect, getCurrentUser);
router.put("/me", protect, updateCurrentUser);

export default router;
