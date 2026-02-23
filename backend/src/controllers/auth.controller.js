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
