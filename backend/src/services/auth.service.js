import User from "../models/users.model.js"
import bcrypt from "bcryptjs"

export const Register = async({email,password})=>{
    // if(!email || !password) {
    //     throw new Error("Missing email or password");
    // }
  
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