const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: true
    },
    method: {
        type: String,
        enum: ['Cash', 'Credit Card', 'Mobile Payment'],
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Completed', 'Failed'],
        default: 'Pending'
    },
    paidAt: {
        type: Date,
        default: Date.now
    }
});

const Payment = mongoose.model('Payment', PaymentSchema);
module.exports = Payment;    