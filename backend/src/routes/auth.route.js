import express from "express";
import {Register, Login, RefreshToken, ResetPassword, ForgotPassword, Logout} from "../controllers/auth.controller.js"
import passport from "passport";
import jwt from "jsonwebtoken";
const router = express.Router();

router.post("/register", Register);
router.post("/login", Login);
router.post("/refreshToken",RefreshToken);

router.post("/forgot-password", ForgotPassword);
router.post("/reset-password/:token", ResetPassword);
router.post("/logout", Logout);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  async (req, res) => {
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

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    res.redirect(`${process.env.FRONTEND_URL}/`);
  }
);

export default router;



