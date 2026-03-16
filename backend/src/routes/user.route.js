import express from "express";
import { updateMe } from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.put("/me", authMiddleware, updateMe);

export default router;
