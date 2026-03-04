import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    fullName: {type: String},
    email: {type: String, required: true},
    password: {type: String, required: true}, 
    phone: {type: String},
    role:{type: String, enum:["customer", "admin", "staff"], default:"user"},
    imgUrl: {type: String},
    refreshToken:{type: String},
    membershipId: {type: Number},
},{timestamps:true})
const User = mongoose.model("User", userSchema);
export default User;