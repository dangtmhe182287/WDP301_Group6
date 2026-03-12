import mongoose from "mongoose";
const StaffRequestSchema = mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, 
        ref: "User",
        required: true
    },
    speciality:[{type: String}],
    certificate: {
        name: {type: String},
        organization: {type: String},
        certificateId: {type: String},
        image: {type: String},
    },
    portfolio: [{type: String}],
    status:{
        type: String, 
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    }, 
    adminNote: {type: String}
}, 
{timestamps: true})
const StaffRequest = mongoose.model("StaffRequest", StaffRequestSchema);
export default StaffRequest;