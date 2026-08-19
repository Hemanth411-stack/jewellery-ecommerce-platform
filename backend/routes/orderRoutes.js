import express from "express";
import {
  changeOrderStatus,
  checkout,
  listAllOrders,
  listMyOrders,
} from "../controllers/orderController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/checkout", checkout);
router.get("/my-orders", listMyOrders);
router.get("/admin", adminOnly, listAllOrders);
router.patch("/admin/:orderId/status", adminOnly, changeOrderStatus);

export default router;
