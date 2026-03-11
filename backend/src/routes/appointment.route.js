import express from "express";
import { CreateAppointment, GetAvailableSlots } from "../controllers/appointment.controller.js";

const router = express.Router();

router.get("/availability", GetAvailableSlots);
router.post("/create", CreateAppointment);

export default router;