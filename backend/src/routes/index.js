import express from "express";
import authRouter from "./auth.route.js"
import serviceRouter from "./service.route.js"
import appointmentRouter from "./appointment.route.js"
import staffRequestRouter from "./staffRequest.route.js"
import createError from "http-errors";
const router = express.Router();

router.use("/auth", authRouter);
router.use("/services", serviceRouter);
router.use("/appointments", appointmentRouter);
router.use("/staff-request", staffRequestRouter);
// Handle 404 (if not matched any router)
router.use((req, res, next) =>{
    next(createError.NotFound());
    console.log("error in index.js");
    
});


export default router;
