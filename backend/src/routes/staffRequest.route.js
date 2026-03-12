import express from "express"
import { applyStaffRequest, getRequests } from "../controllers/staffRequest.controller.js"
import { authMiddleware } from "../middlewares/auth.middleware.js";
const router = express.Router();

router.post("/applyStaffRequest",authMiddleware, applyStaffRequest);
router.get("/getRequests", getRequests);
export default router;