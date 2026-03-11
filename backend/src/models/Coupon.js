import mongoose from "mongoose"

const CouponSchema = new mongoose.Schema({
    name: String,

    code: {
        type: String,
        required: true,
        unique: true
    },

    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service'
    },

    membershipType: {
        type: String,
        enum: ['gold', 'diamond']
    },

    percent: {
        type: Number,
        min: 0,
        max: 100
    },

    startDate: Date,
    endDate: Date

}, { timestamps: true });

const Coupon  = mongoose.model('Coupon', CouponSchema);
export default Coupon;
