import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { GetBusinessHours, UpdateBusinessHours } from "../controllers/businessHours.controller.js";

const router = express.Router();

router.get("/business-hours", GetBusinessHours);
router.put("/business-hours", authMiddleware, UpdateBusinessHours);

export default router;
