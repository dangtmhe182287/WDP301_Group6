import express from "express";
import authRouter from "./auth.route.js"
import serviceRouter from "./service.route.js"
import appointmentRouter from "./appointment.route.js"
import staffRequestRouter from "./staffRequest.route.js"
import settingsRouter from "./settings.route.js"
import rateRouter from "./rate.route.js"
import aiRouter from "./ai.route.js";

import staffRouter from "./staff.route.js"
import userRouter from "./user.route.js"
import createError from "http-errors";
const router = express.Router();

router.use("/auth", authRouter);
router.use("/services", serviceRouter);
router.use("/appointments", appointmentRouter);
router.use("/staffs", staffRouter);
router.use("/users", userRouter);
router.use("/staff-request", staffRequestRouter);
router.use("/settings", settingsRouter);
router.use("/rates", rateRouter);
router.use("/ai", aiRouter);


// Handle 404 (if not matched any router)
router.use((req, res, next) =>{
    next(createError.NotFound());
    console.log("error in index.js");
    
});


export default router;
