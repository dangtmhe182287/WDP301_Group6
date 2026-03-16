import * as authService from "../services/auth.service.js"
export const Register = async(req, res)=>{
    const {fullName, email, password, phone} = req.body;
    console.log("BODY:", req.body);
    try {
        const user =await authService.Register({fullName, email, password, phone});
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({message: error.message});
    }
}
export const Login = async(req, res) =>{
    const {email, password} = req.body;
    try {
        const {user, accessToken, refreshToken} = await authService.Login({email, password});
        res.status(201).json({message: "Login success",
             accessToken,
             user
        });
    } catch (error) {
        res.status(400).json({message: error.message});
    }
}
export const RefreshToken = async(req, res)=>{
    try {
        const {refreshToken} = req.body;
        console.log("Refresh Token received:",refreshToken);
        const session = await authService.refreshToken(refreshToken);
        res.status(201).json(session);
    } catch (error) {
        res.status(400).json({message: error.message});
    }
}
export const Logout = async(req,res)=>{
    try {
        await authService.Logout(req.user.userId);
    } catch (error) {
        res.status(400).json({message: error.message});
    }
}