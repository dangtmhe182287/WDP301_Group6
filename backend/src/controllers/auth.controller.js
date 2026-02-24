import * as authService from "../services/auth.service.js"
export const Register = async(req, res)=>{
    const {email, password} = req.body;
    console.log("BODY:", req.body);
    try {
        const user =await authService.Register({email, password});
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({message: error.message});
    }
}
export const Login = async(req, res) =>{
    const {email, password} = req.body;
    try {
        const user = await authService.Login({email, password});
        res.status(201).json("Login Success!");
    } catch (error) {
        res.status(400).json({message: error.message});
    }
}
export const RefreshToken = async(req, res)=>{
    const {refreshToken} = req.body;
    console.log("Refresh Token received:",refreshToken);
    try {
        const newAccessToken = await authService.refreshToken({refreshToken});
        res.status(201).json(newAccessToken);
    } catch (error) {
        res.status(400).json({message: error.message});
    }
}
export const Logout = async(req,res)=>{
    try {
        await authService.Logout(req.user.userId);
        res.status(201).json("Logged out!");
    } catch (error) {
        res.status(400).json({message: error.message});
    }
}