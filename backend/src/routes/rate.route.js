import express from "express";
import {
    CreateRate,
    GetRateByAppointmentId,
    GetRatesByStaffId,
    GetStaffAverageRate
} from "../controllers/rate.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/staff/:staffId", authMiddleware, CreateRate);
router.get("/appointment/:appointmentId", GetRateByAppointmentId);
router.get("/staff/:staffId", GetRatesByStaffId);
router.get("/staff/:staffId/average", GetStaffAverageRate);

export default router;

