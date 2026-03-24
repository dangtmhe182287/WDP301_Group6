import User from "../models/User.model.js";
import Staff from "../models/Staff.model.js";
import bcrypt from "bcryptjs";
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
    const users = await User.find({ role: "staff" }).lean();
    
    const staffs = await Promise.all(users.map(async (user) => {
      const staffInfo = await Staff.findOne({ userId: user._id }).lean();
      return {
        ...user,
        staff: staffInfo || null
      };
    }));

    res.status(200).json(staffs);
  } catch (error) {
    console.error("GET STAFFS ERROR:", error);
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

/* ===== Confirm Payment ===== */
export const confirmPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await staffService.confirmPayment(id);
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

/* ===== CRUD Staff (Admin) ===== */
export const createStaff = async (req, res) => {
  try {
    const { fullName, email, phone, staffSpecialty, staffExperienceYears, speciality, experienceYears, certificate, portfolio, schedule } = req.body;
    
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email đã tồn tại!" });

    // Create user role staff with default password
    const hashedPassword = await bcrypt.hash("123456", 10);
    const newUser = await User.create({
      fullName,
      email,
      phone,
      password: hashedPassword,
      role: "staff"
    });

    const finalSpeciality = Array.isArray(speciality) && speciality.length > 0
      ? speciality
      : (staffSpecialty ? staffSpecialty.split(",").map(s => s.trim()) : []);
      
    const finalExperience = experienceYears || staffExperienceYears || 0;

    const newStaff = await Staff.create({
      userId: newUser._id,
      speciality: finalSpeciality,
      experienceYears: finalExperience,
      certificate: certificate || {},
      portfolio: portfolio || [],
      schedule: schedule || []
    });

    res.status(201).json({ message: "Tạo thợ cắt thành công", user: newUser, staff: newStaff });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, email, phone, staffSpecialty, staffExperienceYears, speciality, experienceYears, certificate, portfolio, schedule } = req.body;
    
    const staff = await Staff.findById(id);
    if (!staff) return res.status(404).json({ message: "Không tìm thấy thợ cắt" });

    // Update User
    if (fullName || email || phone) {
        if (email) {
            const existingUser = await User.findOne({ email, _id: { $ne: staff.userId } });
            if (existingUser) return res.status(400).json({ message: "Email đã tồn tại!" });
        }
        await User.findByIdAndUpdate(staff.userId, { fullName, email, phone });
    }

    // Update Staff details
    const finalSpeciality = Array.isArray(speciality) && speciality.length > 0
      ? speciality
      : (staffSpecialty ? staffSpecialty.split(",").map(s => s.trim()) : staff.speciality);
      
    const finalExperience = experienceYears !== undefined ? experienceYears : (staffExperienceYears !== undefined ? staffExperienceYears : staff.experienceYears);

    staff.speciality = finalSpeciality;
    staff.experienceYears = finalExperience;
    if (certificate) staff.certificate = certificate;
    if (portfolio) staff.portfolio = portfolio;
    if (schedule) staff.schedule = schedule;
    
    await staff.save();

    res.status(200).json({ message: "Cập nhật thành công", staff });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const staff = await Staff.findById(id);
    if (!staff) return res.status(404).json({ message: "Không tìm thấy thợ cắt" });

    await User.findByIdAndDelete(staff.userId);
    await Staff.findByIdAndDelete(id);

    res.status(200).json({ message: "Xoá thợ cắt thành công" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};