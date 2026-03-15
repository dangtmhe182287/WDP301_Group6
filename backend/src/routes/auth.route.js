import express from "express";
import {Register, Login, RefreshToken} from "../controllers/auth.controller.js"
import passport from "passport";
import jwt from "jsonwebtoken";
const router = express.Router();

router.post("/register", Register);
router.post("/login", Login);
router.post("/refreshToken",RefreshToken);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const user = req.user;

    const accessToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

   res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    res.redirect(`${process.env.FRONTEND_URL}?token=${accessToken}`);
  }
);

export default router;



