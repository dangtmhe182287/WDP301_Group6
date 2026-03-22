import express from "express";
import { CreateAppointment, GetAvailableSlots, GetMyAppointments, CancelAppointment, GetAllAppointments } from "../controllers/appointment.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/availability", GetAvailableSlots);
router.post("/create", CreateAppointment);
router.get("/my", authMiddleware, GetMyAppointments);
router.post("/:id/cancel", authMiddleware, CancelAppointment);
router.get("/all", GetAllAppointments);

export default router;
