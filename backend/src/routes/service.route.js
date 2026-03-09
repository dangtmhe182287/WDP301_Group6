import express from "express";
import {
    GetAllServices,
    GetServiceById,
    CreateService,
    UpdateService,
    DeleteService,
} from "../controllers/service.controller.js";

const router = express.Router();

router.get("/", GetAllServices);
router.get("/:id", GetServiceById);
router.post("/create/", CreateService);
router.put("/update/:id", UpdateService);
router.delete("/delete/:id", DeleteService);

export default router;