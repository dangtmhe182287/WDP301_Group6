import User from "../models/User.model.js";

export const getStaffs = async (req, res) => {
  try {
    const staffs = await User.find({ role: "staff" }).select(
      "fullName email phone speciality experienceYears imgUrl role"
    );
    res.status(200).json(staffs);
  } catch (error) {
    res.status(400).json({ message: "Get staffs error", error: error.message });
  }
};
