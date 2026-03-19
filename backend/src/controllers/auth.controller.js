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
        // set cookie
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            sameSite: "Lax",
            secure: false,
        })
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
        console.log("Cookies:", req.cookies);
        const refreshToken = req.cookies.refreshToken;
        console.log("Refresh Token received:",refreshToken);
        const session = await authService.refreshToken(refreshToken);
        res.status(201).json(session);
    } catch (error) {
        res.status(400).json({message: error.message});
    }
}
export const Logout = async(req,res)=>{
    try {
        res.clearCookie("refreshToken");
        res.status(200).json({message: "Logged out"})
        await authService.Logout(req.user.userId);
    } catch (error) {
        res.status(400).json({message: error.message});
    }
}

export const ForgotPassword = async(req,res)=>{
    try {
        const {email} = req.body;

        const resetLink = await authService.forgotPassword(email);

        res.status(200).json({
            message:"Reset password link generated",
            resetLink
        });

    } catch (error) {
        res.status(400).json({message:error.message});
    }
}


export const ResetPassword = async(req,res)=>{
    try {
        const {token} = req.params;
        const {password} = req.body;

        const message = await authService.resetPassword(token,password);

        res.status(200).json({message});

    } catch (error) {
        res.status(400).json({message:error.message});
    }
}