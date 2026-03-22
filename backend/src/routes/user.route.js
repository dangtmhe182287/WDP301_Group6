import express from "express";
import { updateAvatar, updateMe, getCustomerStats, getDashboardStats } from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { uploadAvatar } from "../middlewares/upload.middleware.js";

const router = express.Router();

router.put("/me", authMiddleware, updateMe);
router.post("/me/avatar", authMiddleware, uploadAvatar.single("avatar"), updateAvatar);
router.get("/admin/customers-stats", getCustomerStats);
router.get("/admin/dashboard-stats", getDashboardStats);

export default router;
