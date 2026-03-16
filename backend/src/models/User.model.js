import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    fullName: { type: String },
    email: { type: String, required: true , unique: true, lowercase: true},
    password: { type: String },
       googleId: {
        type: String
    },
    phone: { type: String },
    role: { type: String, enum: ["customer", "admin", "staff"], default: "customer" },
    imgUrl: { type: String },
    refreshToken: { type: String },
    membershipId: { type: Number },
    membershipType: {
        type: String,
        enum: ['normal', 'gold', 'diamond'],
        default: 'normal'
    },

    
},
    { timestamps: true }
);
const User = mongoose.model("User", userSchema);
export default User;