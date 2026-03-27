import Appointment from "../models/Appointment.model.js";

export const findByStaff = (staffId, filter = {}) => {
  return Appointment.find({
    ...filter,
    $or: [
      { staffId },
      { "serviceStaffAssignments.staffId": staffId },
    ],
  })
    .populate("customerId", "fullName email phone")
    .populate("serviceIds", "name price duration")
    .sort({ appointmentDate: -1 });
};

export const findById = (id) => {
  return Appointment.findById(id)
    .populate("customerId")
    .populate("serviceIds");
};

export const updateStatus = (id, status) => {
  return Appointment.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  );
};

export const countByStatus = (staffId) => {
  return Appointment.aggregate([
    {
      $match: {
        $or: [
          { staffId },
          { "serviceStaffAssignments.staffId": staffId },
        ],
      },
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 }
      }
    }
  ]);
};

export const confirmPayment = (id) => {
  return Appointment.findByIdAndUpdate(
    id,
    { paymentStatus: "Paid" },
    { new: true }
  );
};
