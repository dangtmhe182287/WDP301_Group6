import bcrypt from "bcryptjs";
import User from "../models/User.model.js";

export const updateMe = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { fullName, phone, password } = req.body;
    const updates = {};

    if (fullName !== undefined) {
      updates.fullName = fullName;
    }

    if (phone !== undefined) {
      updates.phone = phone;
    }

    if (password) {
      updates.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
    }).select("-password -refreshToken");

    res.status(200).json({ message: "Update success", user: updatedUser });
  } catch (error) {
    res.status(400).json({ message: "Update user error", error: error.message });
  }
};
