import express from "express"
import { applyStaffRequest, getRequests, approveStaffRequest, rejectStaffRequest } from "../controllers/staffRequest.controller.js"
import { authMiddleware } from "../middlewares/auth.middleware.js";
const router = express.Router();

router.post("/applyStaffRequest",authMiddleware, applyStaffRequest);
router.get("/getRequests", getRequests);
router.patch("/approveRequest/:id", approveStaffRequest);
router.patch("/rejectRequest/:id", rejectStaffRequest);

export default router;