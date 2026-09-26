import express from "express";
import {
  changeOrderStatus,
  changeOrderTrackingReference,
  startOnlineCheckout,
  confirmOnlinePayment,
  listAllOrders,
  listMyOrders,
} from "../controllers/orderController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";
import { getSenderAddresses, saveSenderAddress } from "../controllers/senderAddressController.js";

const router = express.Router();

router.use(protect);

router.post("/online-checkout", startOnlineCheckout);
router.post("/:orderId/verify-payment", confirmOnlinePayment);
router.get("/my-orders", listMyOrders);
router.get("/admin", adminOnly, listAllOrders);
router.get("/admin/sender-addresses", adminOnly, getSenderAddresses);
router.put("/admin/sender-addresses/:provider", adminOnly, saveSenderAddress);
router.patch("/admin/:orderId/status", adminOnly, changeOrderStatus);
router.patch("/admin/:orderId/tracking", adminOnly, changeOrderTrackingReference);

export default router;
