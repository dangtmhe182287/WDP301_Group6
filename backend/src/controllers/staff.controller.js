import User from "../models/User.model.js";

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
