import express from "express";
import * as staffController from "../controllers/staff.controller.js";

const router = express.Router();


router.get("/", staffController.getStaffs);
router.post("/", staffController.createStaff);
router.put("/:id", staffController.updateStaff);
router.delete("/:id", staffController.deleteStaff);
// appointments
router.get("/appointments", staffController.getAppointments);
router.patch("/appointments/:id/status", staffController.updateStatus);

// schedule
router.get("/schedule", staffController.getSchedule);
router.put("/schedule", staffController.updateSchedule);

// customer
router.get("/customer/:id", staffController.getCustomer);

// dashboard
router.get("/dashboard", staffController.getDashboard);

export default router;