import * as appointmentRepo from "../repositories/appointment.repository.js";
import * as staffRepo from "../repositories/staff.repository.js";
import * as userRepo from "../repositories/user.repository.js";

/* ================= Appointment List ================= */
export const getAppointments = async (userId) => {
  const staff = await staffRepo.findByUserId(userId);
  if (!staff) throw new Error("Staff not found");

  return appointmentRepo.findByStaff(staff.userId);
};

/* ================= Update Status ================= */
export const updateAppointmentStatus = async (id, status) => {
  const valid = ["Pending", "Scheduled", "Completed", "Cancelled", "NoShow"];
  if (!valid.includes(status)) throw new Error("Invalid status");

  return appointmentRepo.updateStatus(id, status);
};

/* ================= Confirm Payment ================= */
export const confirmPayment = async (id) => {
  return appointmentRepo.confirmPayment(id);
};

/* ================= Staff Schedule ================= */
export const getSchedule = async (userId) => {
  const staff = await staffRepo.findByUserId(userId);
  return staff.schedule;
};

export const updateSchedule = async (userId, schedule) => {
  const staff = await staffRepo.findByUserId(userId);
  return staffRepo.updateSchedule(staff._id, schedule);
};

/* ================= Customer Detail ================= */
export const getCustomerDetail = async (customerId) => {
  return userRepo.findById(customerId);
};

/* ================= Dashboard ================= */
export const getDashboard = async (userId) => {
  const staff = await staffRepo.findByUserId(userId);

  const stats = await appointmentRepo.countByStatus(staff.userId);

  return stats;
};
