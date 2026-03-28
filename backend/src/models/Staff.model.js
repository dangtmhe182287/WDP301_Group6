import mongoose from "mongoose";
const StaffSchema = new mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
     },
     speciality: [
        {type: String}
     ],
     experienceYears: {type: Number, default: 0},
     certificate: {
        name: {type: String},
        organization: {type: String},
        certificateId: {type: String},
        image: {type: String}
     }, 
     portfolio : [{type: String}],
     rating: {type: Number, default: 0},
     serviceIds: [
        { type: mongoose.Schema.Types.ObjectId, ref: "Service" }
     ],
     schedule: [
        {
            workingDate: {type: Date},
            startTime: {type: String}, 
            endTime: {type: String}
    }
     ]
     

}, {timestamps: true})
const Staff = mongoose.model("Staff", StaffSchema);
export default Staff;
