import Staff from "../models/Staff.model.js";

export const findByUserId = (userId) => {
  return Staff.findOne({ userId });
};

export const updateSchedule = (staffId, schedule) => {
  return Staff.findByIdAndUpdate(
    staffId,
    { schedule },
    { new: true }
  );
};