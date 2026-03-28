import mongoose from "mongoose"

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
        isFeatured: {
            type: Boolean,
            default: false,
        },
        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            default: null,
        },
    },

    {timestamps: true}
);
const Service = mongoose.model('Service', serviceSchema);
export default Service;
