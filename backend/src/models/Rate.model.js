const mongoose = require('mongoose');

const RateSchema = new mongoose.Schema({
    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
        required: true,
    },
    rating: {
        type: Number,
        required: true,
    },
    comment: {
        type: String,
    },
}, {
    timestamps: {
        createdAt: true,
        updatedAt: false
    }
});

const Rate = mongoose.model('Rate', RateSchema);
module.exports = Rate;