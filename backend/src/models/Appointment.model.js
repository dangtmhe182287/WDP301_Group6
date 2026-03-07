const mongoose = require('mongoose');


const phaseTimelineSchema = new mongoose.Schema({
    name: {type: String, required: true, trim: true},
    duration: {type: Number, required: true, min: 1},
    requiresStaff: {type: Boolean, required: true},
    startMinute: {type: Number, required: true, min: 1},
    endMinute: {type: Number, required: true, min: 1},
    },

    {_id: false}//no auto create id
);

const timeRangeSchema = new mongoose.Schema({
    startMinute: {type: Number, required: true, min: 0},
    endMinute: {type: Number, required: true, min: 1},
    },
    {_id: false}
);
const AppointmentSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true,
    },
    staffId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff',
        required: true,
    },
    appointmentDate: {
        type: Date,
        required: true,
    },
    startTime: {
        type: Number,
        required: true
    },
    endTime: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Scheduled', 'Completed', 'Cancelled'],
        default: 'Pending',
        required: true
    },
    note: {
        type: String
    },
    paymentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment',
        required: true
    }
});

const AppointmentServiceSchema = new mongoose.Schema({
    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
        required: true,
    },
    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        required: true,
    },
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    couponId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coupon',
    }
});

const Appointment = mongoose.model('Appointment', AppointmentSchema);
const AppointmentService = mongoose.model('AppointmentService', AppointmentServiceSchema);
module.exports = {Appointment, AppointmentService};