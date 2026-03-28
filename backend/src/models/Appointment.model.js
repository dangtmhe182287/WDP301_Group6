import mongoose from "mongoose";

const timeRangeSchema = new mongoose.Schema(
  {
    startMinute: { type: Number, required: true, min: 0 },
    endMinute: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const serviceAssignmentSchema = new mongoose.Schema(
  {
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    startMinute: { type: Number, required: true, min: 0 },
    endMinute: { type: Number, required: true, min: 1 },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
  },
  { _id: false }
);

const appointmentSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    customerName: {
      type: String,
      trim: true,
    },
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    serviceIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    }],
    bookingChannel: {
      type: String,
      enum: ["online", "offline"],
      required: true,
    },
    createdByRole: {
      type: String,
      enum: ["customer", "staff", "admin"],
      required: true,
    },
    appointmentDate: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Scheduled", "Completed", "Cancelled", "NoShow"],
      default: "Scheduled",
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["Unpaid", "Paid"],
      default: "Unpaid",
      required: true,
    },
    note: { type: String, trim: true },
    staffBusySlots: [timeRangeSchema],
    staffFreeSlots: [timeRangeSchema],
    serviceStaffAssignments: [serviceAssignmentSchema],
  },
  { timestamps: true }
);

const Appointment = mongoose.model("Appointment", appointmentSchema);

export default Appointment;
