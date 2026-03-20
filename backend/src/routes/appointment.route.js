import express from "express";
import { CreateAppointment, GetAvailableSlots, GetMyAppointments, CancelAppointment } from "../controllers/appointment.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/availability", GetAvailableSlots);
router.post("/create", CreateAppointment);
router.get("/my", authMiddleware, GetMyAppointments);
router.post("/:id/cancel", authMiddleware, CancelAppointment);

export default router;
