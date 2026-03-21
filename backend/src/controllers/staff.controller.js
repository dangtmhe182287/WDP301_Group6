import User from "../models/User.model.js";
import * as staffService from "../services/staff.service.js";
import { verifyToken } from "../utils/jwt.js";


/* ===== HELPER LẤY USER ===== */
const getUserFromReq = (req) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) return null;

  const token = authHeader.split(" ")[1];

  return verifyToken(token, process.env.JWT_ACCESS_SECRET);
};

export const getStaffs = async (req, res) => {
  try {
    // Return all users that have `role: "staff"` along with their related Staff document
    // (which contains details like speciality, experienceYears, certificate, etc.).
    const staffs = await User.aggregate([
      { $match: { role: "staff" } },
      {
        $lookup: {
          from: "staffs",
          localField: "_id",
          foreignField: "userId",
          as: "staff",
        },
      },
      { $unwind: { path: "$staff", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          fullName: 1,
          email: 1,
          phone: 1,
          role: 1,
          imgUrl: 1,
          "staff.speciality": 1,
          "staff.experienceYears": 1,
          "staff.certificate": 1,
          "staff.portfolio": 1,
          "staff.rating": 1,
          "staff.schedule": 1,
        },
      },
    ]);

    res.status(200).json(staffs);
  } catch (error) {
    res.status(400).json({ message: "Get staffs error", error: error.message });
  }
};

/* ===== Appointment List ===== */
export const getAppointments = async (req, res) => {
  try {
    const user = getUserFromReq(req);

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const data = await staffService.getAppointments(user.id);
    res.json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ===== Update Status ===== */
export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const data = await staffService.updateAppointmentStatus(id, status);
    res.json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ===== Schedule ===== */
export const getSchedule = async (req, res) => {
  try {
    const user = getUserFromReq(req);

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const data = await staffService.getSchedule(user.id);
    res.json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateSchedule = async (req, res) => {
  try {
    const user = getUserFromReq(req);

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const data = await staffService.updateSchedule(
      user.id,
      req.body.schedule
    );

    res.json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ===== Customer Detail ===== */
export const getCustomer = async (req, res) => {
  try {
    const data = await staffService.getCustomerDetail(req.params.id);
    res.json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ===== Dashboard ===== */
export const getDashboard = async (req, res) => {
  try {
    const user = getUserFromReq(req);

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const data = await staffService.getDashboard(user.id);
    res.json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};