import express from "express";
import {
    GetAllRates,
    GetRateById,
    GetRatesByStaffId,
    GetStaffAverageRate
} from "../controllers/rate.controller.js";

const router = express.Router();

router.get("/", GetAllRates);
router.get("/:id", GetRateById);
router.get("/staff/:staffId", GetRatesByStaffId);
router.get("/staff/:staffId/average", GetStaffAverageRate);

export default router;

