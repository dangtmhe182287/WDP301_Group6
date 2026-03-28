import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  GetAllCategories,
  CreateCategory,
  UpdateCategory,
  DeleteCategory,
} from "../controllers/category.controller.js";

const router = express.Router();

router.get("/", GetAllCategories);
router.post("/", authMiddleware, CreateCategory);
router.put("/:id", authMiddleware, UpdateCategory);
router.delete("/:id", authMiddleware, DeleteCategory);

export default router;
