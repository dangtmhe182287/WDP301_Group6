import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    fullName: { type: String },
    email: { type: String, required: true },
    password: { type: String, required: true },
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

    //staff specific profile fields
    speciality: {
        type: String,
        trim: true,
        validate: {
            validator(value) {
                if (this.role != "staff") return true; // if not staff, return
                return Boolean(value && value.trim().length > 0); //if true, pass validator
            },
            message: "Speciality is required for staff accounts",
        },
    },

    experienceYears: {
        type: Number,
        min: 0,
        validate: {
            validator(value) {
                if (this.role != "staff") return true; // if not staff, return
                return Number.isInteger(value) && value >= 0; //if true, pass validator
            },
            message: "Experience years must be non negative inter for staff accounts",
        },
    },
},
    { timestamps: true }
);
const User = mongoose.model("User", userSchema);
export default User;