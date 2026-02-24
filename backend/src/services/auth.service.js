import User from "../models/users.model.js"
import bcrypt from "bcryptjs"
import { generateAccessToken, generateRefreshToken, verifyToken } from "../utils/jwt.js"
export const Register = async({email,password})=>{
    const existed = await User.findOne({email});
    if(existed) throw new Error("Email is already existed!");
    const harsh_password = await bcrypt.hash(password, 10);
    const newUser = await User.create({
        email: email,
        password: harsh_password,
        role: "customer",
    })
    return newUser;
}
export const Login = async({email, password}) =>{
    const user = await User.findOne({email});
    if(!user) throw new Error("Invalid user!");
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
    const payload = verifyToken(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(payload.userId);
    if(!user || user.refreshToken !== token)
        throw new Error("Invalid refresh token");
    const newAccessToken = generateAccessToken(user);
    return {accessToken: newAccessToken};
}
export const Logout = async(userId)=>{
    await User.findByIdAndDelete(userId, {refreshToken:null});
}