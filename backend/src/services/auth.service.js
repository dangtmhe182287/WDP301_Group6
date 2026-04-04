import User from "../models/User.model.js"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { generateAccessToken, generateRefreshToken, verifyToken } from "../utils/jwt.js"
import { sendEmail } from "../utils/sendEmail.js"
export const Register = async({fullName,email,password, phone})=>{
    const existed = await User.findOne({email});
    if(existed) throw new Error("Email is already existed!");
    const harsh_password = await bcrypt.hash(password, 10);
    const newUser = await User.create({
        fullName: fullName,
        email: email,
        password: harsh_password,
        phone: phone,
        role: "customer",
    })
    return newUser;
}
export const Login = async({email, password}) =>{
    const user = await User.findOne({email});
    if(!user) throw new Error("Invalid user!");
    if(user.isBanned) throw new Error("Tài khoản của bạn đã bị khóa.");
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch) throw new Error("Password is wrong!");
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    user.refreshToken = refreshToken;
    await user.save();
    return {user, accessToken, refreshToken}

}
// cấp lại AccessToken
export const refreshToken = async(token) =>{
    if(!token) throw new Error("No refresh token");
    const payload = verifyToken(token, process.env.JWT_REFRESH_SECRET);
    if(!payload) throw new Error("Invalid or expired refresh token")
    const user = await User.findById(payload.id);
    if(!user || user.refreshToken !== token)
        throw new Error("Invalid refresh token");
    if(user) {
        console.log("User:",user._id);
    }
    const newAccessToken = generateAccessToken(user);
    console.log("Cookie token:", token);
console.log("DB token:", user.refreshToken);
    return {accessToken: newAccessToken, user};
}
export const Logout = async(userId)=>{
    await User.findByIdAndUpdate(userId, {refreshToken:null});
}

export const forgotPassword = async(email)=>{
    const user = await User.findOne({email});
    if(!user) throw new Error("Email not found");

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 15*60*1000;

    await user.save();

    const resetLink = `http://localhost:5173/reset-password/${resetToken}`;

    await sendEmail(
        user.email,
        "Reset Password - Elysina",
        `
        <h3>Reset Password</h3>
        <p>Click vào link bên dưới để đổi mật khẩu:</p>
        <a href="${resetLink}">${resetLink}</a>
        `
    );

    return resetLink;
}

export const resetPassword = async(token, newPassword)=>{
    const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpire: {$gt: Date.now()}
    });

    if(!user) throw new Error("Token invalid or expired");

    const harsh_password = await bcrypt.hash(newPassword, 10);

    user.password = harsh_password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    return "Password updated successfully";
}