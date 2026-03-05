import express from "express";
import authRouter from "./auth.route.js"
import serviceRouter from "./service.route.js"
import createError from "http-errors";
const router = express.Router();

router.use("/auth", authRouter);
router.use("/services", serviceRouter);

// Handle 404 (if not matched any router)
router.use((req, res, next) =>{
    next(createError.NotFound());
    console.log("error in index.js");
    
});


export default router;
