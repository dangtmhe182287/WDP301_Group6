import express from "express";
import { CreateAppointment, GetAvailableSlots, GetMyAppointments, CancelAppointment, GetAllAppointments, RescheduleAppointment } from "../controllers/appointment.controller.js";
import { authMiddleware, requireRole } from "../middlewares/auth.middleware.js";
import { confirmPayment } from "../controllers/appointment.controller.js";

const router = express.Router();

router.get("/availability", GetAvailableSlots);
router.post("/create", CreateAppointment);
router.get("/my", authMiddleware, GetMyAppointments);
router.post("/:id/cancel", authMiddleware, CancelAppointment);
router.patch("/:id/reschedule", authMiddleware, RescheduleAppointment);
router.get("/all", GetAllAppointments);
router.patch("/:id/confirm-payment", authMiddleware, requireRole("staff", "admin"), confirmPayment);

export default router;
