import BusinessHours from "../models/BusinessHours.model.js";

const DEFAULT_OPEN_MINUTE = 8 * 60;
const DEFAULT_CLOSE_MINUTE = 19 * 60;
const DEFAULT_MIN_LEAD_MINUTES = 60;
const DEFAULT_MAX_DAYS_AHEAD = 15;
const DEFAULT_MAX_UNPAID_APPOINTMENTS = 2;

export const GetBusinessHours = async (req, res) => {
  try {
    let doc = await BusinessHours.findOne();
    if (!doc) {
      doc = await BusinessHours.create({
        openMinute: DEFAULT_OPEN_MINUTE,
        closeMinute: DEFAULT_CLOSE_MINUTE,
        minLeadMinutes: DEFAULT_MIN_LEAD_MINUTES,
        maxDaysAhead: DEFAULT_MAX_DAYS_AHEAD,
        maxUnpaidAppointments: DEFAULT_MAX_UNPAID_APPOINTMENTS,
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
    const { openMinute, closeMinute, minLeadMinutes, maxDaysAhead, maxUnpaidAppointments } = req.body;
    if (openMinute === undefined || closeMinute === undefined) {
      return res.status(400).json({ message: "openMinute and closeMinute are required" });
    }
    if (openMinute < 0 || closeMinute > 1440 || openMinute >= closeMinute) {
      return res.status(400).json({ message: "Invalid business hours" });
    }
    if (minLeadMinutes !== undefined) {
      if (minLeadMinutes < 0 || minLeadMinutes > 1440) {
        return res.status(400).json({ message: "Invalid minimum lead minutes" });
      }
    }
    if (maxDaysAhead !== undefined) {
      if (maxDaysAhead < 1 || maxDaysAhead > 365) {
        return res.status(400).json({ message: "Invalid maximum days ahead" });
      }
    }
    if (maxUnpaidAppointments !== undefined) {
      if (maxUnpaidAppointments < 0 || maxUnpaidAppointments > 20) {
        return res.status(400).json({ message: "Invalid unpaid appointment limit" });
      }
    }
    let doc = await BusinessHours.findOne();
    if (!doc) {
      doc = await BusinessHours.create({
        openMinute,
        closeMinute,
        minLeadMinutes: minLeadMinutes ?? DEFAULT_MIN_LEAD_MINUTES,
        maxDaysAhead: maxDaysAhead ?? DEFAULT_MAX_DAYS_AHEAD,
        maxUnpaidAppointments: maxUnpaidAppointments ?? DEFAULT_MAX_UNPAID_APPOINTMENTS,
      });
    } else {
      doc.openMinute = openMinute;
      doc.closeMinute = closeMinute;
      if (minLeadMinutes !== undefined) doc.minLeadMinutes = minLeadMinutes;
      if (maxDaysAhead !== undefined) doc.maxDaysAhead = maxDaysAhead;
      if (maxUnpaidAppointments !== undefined) doc.maxUnpaidAppointments = maxUnpaidAppointments;
      await doc.save();
    }
    res.status(200).json(doc);
  } catch (error) {
    res.status(400).json({ message: "Update business hours error", error: error.message });
  }
};
