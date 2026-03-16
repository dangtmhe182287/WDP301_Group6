import express from "express";
import { getStaffs } from "../controllers/staff.controller.js";

const router = express.Router();

router.get("/", getStaffs);

export default router;
