import mongoose from "mongoose"

const servicePhaseSchema = new mongoose.Schema({
    name: {type: String, required: true, trim: true},
    duration: {type: Number, required: true, min: 1},
    requiresStaff: {type: Boolean, required: true, default: true},
    },

    {_id: false}
);

const serviceSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        price: {
            type: Number,
            required: true,
            min: 0,
        },

        duration:{
            type: Number,
            required: true,
            min: 1,
        },

        description:{
            type: String,
            required: true,
            trim: true,
        },

        phases: [servicePhaseSchema],
    },

    {timestamps: true}
);
const Service = mongoose.model('Service', serviceSchema);
export default Service;