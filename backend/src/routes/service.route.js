import express from "express";
import {
    GetAllServices,
    GetServiceById,
    CreateService,
    UpdateService,
    InactivateService,
    ActivateService,
    GetServiceBookingStats,
    GetServiceFeedbacks
} from "../controllers/service.controller.js";

const router = express.Router();

router.get("/", GetAllServices);
router.get("/feedbacks", GetServiceFeedbacks);
router.get("/stats/bookings", GetServiceBookingStats);
router.get("/:id", GetServiceById);
router.post("/create", CreateService);
router.put("/update/:id", UpdateService);
router.patch("/:id/inactive", InactivateService);
router.patch("/:id/active", ActivateService);

export default router;
