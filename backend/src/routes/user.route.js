import express from "express";
import { updateAvatar, updateMe } from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { uploadAvatar } from "../middlewares/upload.middleware.js";

const router = express.Router();

router.put("/me", authMiddleware, updateMe);
router.post("/me/avatar", authMiddleware, uploadAvatar.single("avatar"), updateAvatar);

export default router;
