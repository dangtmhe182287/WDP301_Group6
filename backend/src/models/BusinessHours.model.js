import mongoose from "mongoose";

const businessHoursSchema = new mongoose.Schema(
  {
    openMinute: { type: Number, required: true, min: 0, max: 1440 },
    closeMinute: { type: Number, required: true, min: 1, max: 1440 },
  },
  { timestamps: true }
);

const BusinessHours = mongoose.model("BusinessHours", businessHoursSchema);

export default BusinessHours;
