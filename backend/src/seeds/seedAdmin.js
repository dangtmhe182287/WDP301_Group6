import  "../config/env.js"
import db from "../config/db.js"
import User from "../models/User.model.js"
import bcrypt from "bcryptjs"

const seedAdmin = async() =>{
    try {
        await db();
        const email = "admin@gmail.com";
        const hash_password = await bcrypt.hash("admin123", 10);
        const existed = await User.findOne({email});
        if(existed) throw new Error("Email is already existed");
            const newAdmin = new User({
                email: email,
                password: hash_password,
                role: "admin",
            }
            )
        await newAdmin.save();
        console.log("Create admin successfully!");
        process.exit(0);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}
seedAdmin();