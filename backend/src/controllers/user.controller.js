import bcrypt from "bcryptjs";
import User from "../models/User.model.js";
import fs from "fs";
import path from "path";

const deleteOldAvatar = (imgUrl) => {
  if (!imgUrl || !imgUrl.startsWith("/uploads/")) return;
  const filePath = path.join(process.cwd(), imgUrl);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

export const updateMe = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { fullName, phone, password, imgUrl } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
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

    if (imgUrl !== undefined) {
      if (user.imgUrl && user.imgUrl !== imgUrl) {
        deleteOldAvatar(user.imgUrl);
      }
      updates.imgUrl = imgUrl;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
    }).select("-password -refreshToken");

    res.status(200).json({ message: "Update success", user: updatedUser });
  } catch (error) {
    res.status(400).json({ message: "Update user error", error: error.message });
  }
};

export const updateAvatar = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Avatar file is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const imgUrl = `/uploads/avatars/${req.file.filename}`;
    if (user.imgUrl && user.imgUrl !== imgUrl) {
      deleteOldAvatar(user.imgUrl);
    }

    user.imgUrl = imgUrl;
    await user.save();

    const safeUser = user.toObject();
    delete safeUser.password;
    delete safeUser.refreshToken;

    res.status(200).json({ message: "Update avatar success", user: safeUser });
  } catch (error) {
    res.status(400).json({ message: "Update avatar error", error: error.message });
  }
};
