import mongoose from "mongoose";

const businessHoursSchema = new mongoose.Schema(
  {
    openMinute: { type: Number, required: true, min: 0, max: 1440 },
    closeMinute: { type: Number, required: true, min: 1, max: 1440 },
    minLeadMinutes: { type: Number, default: 60, min: 0, max: 1440 },
    maxDaysAhead: { type: Number, default: 15, min: 1, max: 365 },
    maxUnpaidAppointments: { type: Number, default: 2, min: 0, max: 20 },
  },
  { timestamps: true }
);

const BusinessHours = mongoose.model("BusinessHours", businessHoursSchema);

export default BusinessHours;
