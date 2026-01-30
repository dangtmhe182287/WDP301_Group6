import express from "express";
import createError from "http-errors";
const router = express.Router();


// Handle 404 (if not matched any router)
router.use((req, res, next) =>{
    next(createError.NotFound());
});
export default router;
