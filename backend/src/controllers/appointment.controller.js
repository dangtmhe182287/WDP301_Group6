import * as appointmentService from "../services/appointment.service.js";

// Controller tạo lịch hẹn: validate/business rules nằm ở service layer.
export const CreateAppointment = async (req, res) => {
  try {
    const appointment = await appointmentService.createAppointment(req.body);
    res.status(201).json(appointment);
  } catch (error) {
    res.status(400).json({ message: "Create appointment error", error: error.message });
  }
};

// Controller lấy slot trống theo staff + ngày + service.
export const GetAvailableSlots = async (req, res) => {
  try {
    const data = await appointmentService.getAvailableSlots(req.query);
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ message: "Get available slots error", error: error.message });
  }
};

export const GetMyAppointments = async (req, res) => {
  try {
    const customerId = req.user?.id; 
    console.log("Customer ID from token:", customerId);
    const data = await appointmentService.getAppointmentsByCustomer(customerId);
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ message: "Get appointments error", error: error.message });
  }
};

export const CancelAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const customerId = req.user?.id || req.user?.userId;
    const role = req.user?.role;
    const data = await appointmentService.cancelAppointment({ appointmentId, customerId, role });
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ message: "Cancel appointment error", error: error.message });
  }
};
