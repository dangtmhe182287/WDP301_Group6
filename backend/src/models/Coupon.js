const mongoose = require('mongoose');

const CouponSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    code: {
        type: String,
        required: true,
    },
    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        required: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    percent: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    }
}, {
    timestamps: {
        createdAt: true,
        updatedAt: false
    }
});

const Coupon = mongoose.model('Coupon', CouponSchema);
module.exports = Coupon;