import Appointment from "../models/Appointment.model.js";

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

export const GetAllAppointments = async (req, res) => {
  try {
    const data = await Appointment.find()
      .populate("customerId", "fullName email phone")
      .populate("staffId", "fullName email phone")
      .populate("serviceIds", "name duration price")
      .sort({ appointmentDate: -1, startTime: -1 });
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ message: "Get all appointments error", error: error.message });
  }
};

export const confirmPayment = async (req, res) => {
    try {
        const { id } = req.params;
        const appointment = await Appointment.findByIdAndUpdate(
            id,
            { paymentStatus: "Paid" },
            { new: true }
        );
        if (!appointment) return res.status(404).json({ message: "Appointment not found" });
        res.status(200).json({ message: "Payment confirmed", appointment });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


