import BusinessHours from "../models/BusinessHours.model.js";

const DEFAULT_OPEN_MINUTE = 8 * 60;
const DEFAULT_CLOSE_MINUTE = 19 * 60;

export const GetBusinessHours = async (req, res) => {
  try {
    let doc = await BusinessHours.findOne();
    if (!doc) {
      doc = await BusinessHours.create({
        openMinute: DEFAULT_OPEN_MINUTE,
        closeMinute: DEFAULT_CLOSE_MINUTE,
      });
    }
    res.status(200).json(doc);
  } catch (error) {
    res.status(400).json({ message: "Get business hours error", error: error.message });
  }
};

export const UpdateBusinessHours = async (req, res) => {
  try {
    const role = req.user?.role;
    if (role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    const { openMinute, closeMinute } = req.body;
    if (openMinute === undefined || closeMinute === undefined) {
      return res.status(400).json({ message: "openMinute and closeMinute are required" });
    }
    if (openMinute < 0 || closeMinute > 1440 || openMinute >= closeMinute) {
      return res.status(400).json({ message: "Invalid business hours" });
    }
    let doc = await BusinessHours.findOne();
    if (!doc) {
      doc = await BusinessHours.create({ openMinute, closeMinute });
    } else {
      doc.openMinute = openMinute;
      doc.closeMinute = closeMinute;
      await doc.save();
    }
    res.status(200).json(doc);
  } catch (error) {
    res.status(400).json({ message: "Update business hours error", error: error.message });
  }
};
