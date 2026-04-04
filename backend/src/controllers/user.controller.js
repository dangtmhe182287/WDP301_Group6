import bcrypt from "bcryptjs";
import User from "../models/User.model.js";
import Appointment from "../models/Appointment.model.js";
import Service from "../models/Service.model.js";
import fs from "fs";
import path from "path";

const deleteOldAvatar = (imgUrl) => {
  if (!imgUrl || !imgUrl.startsWith("/uploads/")) return;
  const filePath = path.join(process.cwd(), imgUrl);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

export const toggleBanCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    if (user.role !== "customer") {
      return res.status(400).json({ message: "Can only ban customers" });
    }

    user.isBanned = !user.isBanned;
    await user.save();
    
    res.status(200).json({ message: user.isBanned ? "User banned successfully" : "User unbanned successfully", user });
  } catch (error) {
    res.status(400).json({ message: "Toggle ban user error", error: error.message });
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

export const getCustomerStats = async (req, res) => {
  try {
    const stats = await User.aggregate([
      { $match: { role: "customer" } },
      {
        $lookup: {
          from: "appointments",
          localField: "_id",
          foreignField: "customerId",
          as: "appointments",
        },
      },
      {
        $project: {
          fullName: 1,
          email: 1,
          phone: 1,
          isBanned: 1,
          totalBookings: { $size: "$appointments" },
          noShowBookings: {
            $size: {
              $filter: {
                input: "$appointments",
                as: "app",
                cond: { $eq: ["$$app.status", "NoShow"] },
              },
            },
          },
        },
      },
      { $sort: { totalBookings: -1, fullName: 1 } },
    ]);

    res.status(200).json(stats);
  } catch (error) {
    res.status(400).json({ message: "Get customer stats error", error: error.message });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const totalCustomers = await User.countDocuments({ role: "customer" });
    const totalStaff = await User.countDocuments({ role: "staff" });
    const totalAppointments = await Appointment.countDocuments();
    const pendingAppointments = await Appointment.countDocuments({ status: "Pending" });
    
    // Thu nhập từ các đơn completed (giả sử có thể ko chính xác 100% khi service đổi giá, 
    // nhưng đây là cách đơn giản nhất để móc ra data)
    let totalRevenue = 0;
    const completedAppointments = await Appointment.find({ status: "Completed" }).populate("serviceIds", "price");
    completedAppointments.forEach(app => {
      app.serviceIds.forEach(svc => {
        if(svc && svc.price) totalRevenue += svc.price;
      });
    });

    res.status(200).json({
      totalCustomers,
      totalStaff,
      totalAppointments,
      pendingAppointments,
      totalRevenue
    });
  } catch (error) {
    res.status(400).json({ message: "Get dashboard stats error", error: error.message });
  }
};
