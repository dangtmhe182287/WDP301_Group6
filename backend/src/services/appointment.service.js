import Appointment from "../models/Appointment.model.js";
import Service from "../models/Service.model.js";
import BusinessHours from "../models/BusinessHours.model.js";
import User from "../models/User.model.js";

// Booking uses 15-minute blocks, working hours 09:00 - 18:00.
const SLOT_STEP = 15;
const DEFAULT_OPEN_MINUTE = 8 * 60;
const DEFAULT_CLOSE_MINUTE = 19 * 60;
const MAX_SERVICE_PER_APPOINTMENT = 5;
const MAX_TOTAL_DURATION = 270;
const MAX_DAYS_AHEAD = 15;
const MIN_BOOKING_LEAD_MINUTES = 60;
const TZ_OFFSET_MINUTES = 7 * 60;
const TZ_OFFSET_MS = TZ_OFFSET_MINUTES * 60 * 1000;

const getBusinessHours = async () => {
  let doc = await BusinessHours.findOne();
  if (!doc) {
    doc = await BusinessHours.create({
      openMinute: DEFAULT_OPEN_MINUTE,
      closeMinute: DEFAULT_CLOSE_MINUTE,
    });
  }
  return doc;
};

// Convert date input to day start and end in UTC+7 (Asia/Bangkok).
const parseDateParts = (dateInput) => {
  if (typeof dateInput === "string") {
    const match = dateInput.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) {
      return {
        year: Number(match[1]),
        month: Number(match[2]),
        day: Number(match[3]),
      };
    }
  }

  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid appointment date");
  }

  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  };
};

const makeTzDayStart = ({ year, month, day }) => {
  // Store appointmentDate as UTC midnight for the selected local (UTC+7) date
  const utcMidnight = Date.UTC(year, month - 1, day, 0, 0, 0, 0);
  return new Date(utcMidnight);
};

const normalizeDay = (dateInput) => {
  const parts = parseDateParts(dateInput);
  const dayStart = makeTzDayStart(parts);
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
  return { dayStart, dayEnd };
};

const getTodayStart = () => {
  const now = new Date();
  const tzNow = new Date(now.getTime() + TZ_OFFSET_MS);
  const parts = {
    year: tzNow.getUTCFullYear(),
    month: tzNow.getUTCMonth() + 1,
    day: tzNow.getUTCDate(),
  };
  return makeTzDayStart(parts);
};

const isSameDay = (a, b) => {
  const aTz = new Date(a.getTime() + TZ_OFFSET_MS);
  const bTz = new Date(b.getTime() + TZ_OFFSET_MS);
  return (
    aTz.getUTCFullYear() === bTz.getUTCFullYear() &&
    aTz.getUTCMonth() === bTz.getUTCMonth() &&
    aTz.getUTCDate() === bTz.getUTCDate()
  );
};

const getCurrentMinuteOfDay = () => {
  const tzNow = new Date(Date.now() + TZ_OFFSET_MS);
  return tzNow.getUTCHours() * 60 + tzNow.getUTCMinutes();
};

const isOverlap = (startA, endA, startB, endB) => Math.max(startA, startB) < Math.min(endA, endB);//Overlap if end of one is after start of the other.

const parseTimeToMinutes = (value, fieldName = "time") => {
  if (value === undefined || value === null) {
    throw new Error(`${fieldName} is required`);
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    if (/^\d+$/.test(value)) {
      return Number(value);
    }
    const match = value.match(/^(\d{1,2}):(\d{2})$/);
    if (match) {
      const hours = Number(match[1]);
      const minutes = Number(match[2]);
      if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
        return hours * 60 + minutes;
      }
    }
  }
  throw new Error(`Invalid ${fieldName} format`);
};

const formatMinutesToTime = (minutes) => {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
};

// Get service Id from payload
const toServiceIdList = (payload) => {
  //single service id provided
  if (payload.serviceId) {
    return [payload.serviceId];
  }
  //multiple service type string
  if (Array.isArray(payload.serviceIds) && payload.serviceIds.length > 0) {
    return payload.serviceIds;
  }

  throw new Error("At least one service is required");
};

//Convert query from input to get service Id
const parseServiceIds = (query) => {
  //Only single service id provided return service Id
  if (query.serviceId) {
    return [query.serviceId];
  }

  //multiple service type string
  if (typeof query.serviceIds === "string") {
    const splitIds = query.serviceIds
      .split(",") // divine by,
      .map((id) => id.trim()) // get id without space
      .filter(Boolean);//remove empty string

    if (splitIds.length > 0) {
      return splitIds;
    }
  }

  //multiple service type array 
  if (Array.isArray(query.serviceIds) && query.serviceIds.length > 0) {
    return query.serviceIds;
  }
  //no valid service id provided
  return [];
};

// Calculate total duration of all selected services to determine the required slot length.
const getTotalDuration = async (serviceIds) => {
  const services = await Service.find({ _id: { $in: serviceIds } });
  if (services.length !== serviceIds.length) {
    throw new Error("One or more services not found");
  }

  return services.reduce((total, service) => total + service.duration, 0); //total from 0 + duration each service in the list
};

export const createAppointment = async (payload) => {
  const {// Required fields: staffId, appointmentDate, startTime. Optional: customerId, customerName, note.
    customerId,
    customerName,
    staffId,
    bookingChannel = "online",
    createdByRole = "customer",
    appointmentDate,
    startTime,
    note,
  } = payload;
  // Basic validation for required fields and time alignment.
  if (!staffId || !appointmentDate || startTime === undefined) {
    throw new Error("Missing required booking fields");
  }
  if (customerId) {
    const unfinishedCount = await Appointment.countDocuments({
      customerId,
      status: { $ne: "Cancelled" },
      $or: [{ paymentStatus: "Unpaid" }, { status: "Scheduled" }],
    });
    if (unfinishedCount >= 2) {
      throw new Error("Bạn đang có 2 lịch chưa thanh toán hoặc đã lên lịch.");
    }
  }
  const startMinutes = parseTimeToMinutes(startTime, "startTime");
  //backEnd validation to ensure start time is aligned to 15-minute slots.
  if (startMinutes % SLOT_STEP !== 0) {
    throw new Error("Start time must be aligned to 15-minute slots");
  }

  // Use total duration from selected services to reserve the block.
  const serviceIds = toServiceIdList(payload);
  if (serviceIds.length > MAX_SERVICE_PER_APPOINTMENT) {
    throw new Error(`Maximum ${MAX_SERVICE_PER_APPOINTMENT} services per appointment`);
  }
  const totalDuration = await getTotalDuration(serviceIds);
  if (totalDuration > MAX_TOTAL_DURATION) {
    throw new Error(`Total duration must be <= ${MAX_TOTAL_DURATION} minutes`);
  }
  const { openMinute, closeMinute } = await getBusinessHours();
  const endMinutes = startMinutes + totalDuration;
  //Not in working hours
  if (startMinutes < openMinute || endMinutes > closeMinute) {
    throw new Error("Selected time is outside working hours");
  }
  //get appointment day(more than day start and less than day end)
  const { dayStart, dayEnd } = normalizeDay(appointmentDate);
  const todayStart = getTodayStart();
  const latestAllowed = new Date(todayStart);
  latestAllowed.setDate(latestAllowed.getDate() + MAX_DAYS_AHEAD);
  if (dayStart > latestAllowed) {
    throw new Error(`Appointment date must be within ${MAX_DAYS_AHEAD} days`);
  }
  if (isSameDay(dayStart, todayStart)) {
    const minStart = getCurrentMinuteOfDay() + MIN_BOOKING_LEAD_MINUTES;
    if (startMinutes < minStart) {
      throw new Error(`Appointments must be booked at least ${MIN_BOOKING_LEAD_MINUTES} minutes in advance`);
    }
  }
  // Check for overlapping appointments for the staff on the same day.
  const staffAppointments = await Appointment.find({
    staffId,
    appointmentDate: { $gte: dayStart, $lt: dayEnd },
    status: { $nin: ["Cancelled"] },
  });
  // Check if the new appointment overlaps with any existing appointments for the staff.
  const overlapped = staffAppointments.some((appointment) => {
    const apptStart = parseTimeToMinutes(appointment.startTime, "startTime");
    const apptEnd = parseTimeToMinutes(appointment.endTime, "endTime");
    return isOverlap(startMinutes, endMinutes, apptStart, apptEnd);
  });

  if (overlapped) {
    throw new Error("Selected slot conflicts with existing appointments");
  }

  if (customerId) {
    const customerAppointments = await Appointment.find({
      customerId,
      appointmentDate: { $gte: dayStart, $lt: dayEnd },
      status: { $nin: ["Cancelled"] },
    });
    const customerOverlap = customerAppointments.some((appointment) => {
      const apptStart = parseTimeToMinutes(appointment.startTime, "startTime");
      const apptEnd = parseTimeToMinutes(appointment.endTime, "endTime");
      return isOverlap(startMinutes, endMinutes, apptStart, apptEnd);
    });
    if (customerOverlap) {
      throw new Error("You already have an appointment at this time");
    }
  }

  return Appointment.create({
    customerId,
    customerName,
    staffId,
    serviceIds,
    bookingChannel,
    createdByRole,
    appointmentDate: dayStart,
    startTime: formatMinutesToTime(startMinutes),
    endTime: formatMinutesToTime(endMinutes),
    paymentStatus: "Unpaid",
    note,
    staffBusySlots: [{ startMinute: startMinutes, endMinute: endMinutes }],
  });
};

//Get slots to show available time for booking
export const getAvailableSlots = async ({ staffId, appointmentDate, serviceId, serviceIds }) => {
  if (!staffId || !appointmentDate) {
    throw new Error("staffId and appointmentDate are required");
  }

  //get service Id list
  const resolvedServiceIds = parseServiceIds({ serviceId, serviceIds });
  if (resolvedServiceIds.length === 0) {
    throw new Error("At least one service is required");
  }

  const totalDuration = await getTotalDuration(resolvedServiceIds);
  const { dayStart, dayEnd } = normalizeDay(appointmentDate);
  const todayStart = getTodayStart();
  const minLeadStart =
    isSameDay(dayStart, todayStart) ? getCurrentMinuteOfDay() + MIN_BOOKING_LEAD_MINUTES : null;

  const staffAppointments = await Appointment.find({
    staffId,
    appointmentDate: { $gte: dayStart, $lt: dayEnd },
    status: { $nin: ["Cancelled"] },
  }).select("startTime endTime");

  const { openMinute, closeMinute } = await getBusinessHours();
  const slots = [];

  // Each slot is available only if full duration fits and does not overlap.
  for (let minute = openMinute; minute < closeMinute; minute += SLOT_STEP) {
    const endMinute = minute + totalDuration;

    const withinLead = minLeadStart === null || minute >= minLeadStart;
    const available =
      endMinute <= closeMinute && //not exceed working hours
      withinLead &&
      !staffAppointments.some((appointment) => {
        const apptStart = parseTimeToMinutes(appointment.startTime, "startTime");
        const apptEnd = parseTimeToMinutes(appointment.endTime, "endTime");
        return isOverlap(minute, endMinute, apptStart, apptEnd);
      });

    slots.push({//
      startMinute: minute,
      endMinute,
      available,
    });
  }

  return {
    staffId,
    appointmentDate: dayStart,
    serviceIds: resolvedServiceIds,
    serviceDuration: totalDuration,
    slots,
  };
};

export const getAppointmentsByCustomer = async (customerId) => {
  if (!customerId) {
    throw new Error("customerId is required");
  }

  return Appointment.find({ customerId })
    .populate("staffId", "fullName email phone")
    .populate("serviceIds", "name duration price")
    .sort({ appointmentDate: -1, startTime: -1 });
};

export const cancelAppointment = async ({ appointmentId, customerId, role }) => {
  if (!appointmentId) {
    throw new Error("appointmentId is required");
  }

  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    throw new Error("Appointment not found");
  }

  if (appointment.status === "Cancelled") {
    throw new Error("Appointment already cancelled");
  }

  if (role !== "admin" && customerId && String(appointment.customerId) !== String(customerId)) {
    throw new Error("Not allowed to cancel this appointment");
  }

  const startMinutes = parseTimeToMinutes(appointment.startTime, "startTime");
  const startDateTime = new Date(
    new Date(appointment.appointmentDate).getTime() + startMinutes * 60000,
  );

  const now = new Date();
  if (now >= startDateTime) {
    throw new Error("Cannot cancel after the appointment start time");
  }

  const diffMinutes = Math.floor((startDateTime.getTime() - now.getTime()) / 60000);
  if (diffMinutes <= 360 && customerId) {
    await User.findByIdAndUpdate(customerId, { $inc: { canceledLateCount: 1 } });
  }

  appointment.status = "Cancelled";
  await appointment.save();
  return appointment;
};

export const rescheduleAppointment = async (payload) => {
  const {
    appointmentId,
    userId,
    role,
    staffId,
    appointmentDate,
    startTime,
    note,
  } = payload;

  if (!appointmentId) {
    throw new Error("appointmentId is required");
  }

  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    throw new Error("Appointment not found");
  }

  if (["Cancelled", "Completed"].includes(appointment.status)) {
    throw new Error("Cannot reschedule this appointment");
  }

  if (role === "admin") {
    // admin can reschedule any appointment
  } else if (role === "staff") {
    if (String(appointment.staffId) !== String(userId)) {
      throw new Error("Not allowed to reschedule this appointment");
    }
  } else {
    if (String(appointment.customerId) !== String(userId)) {
      throw new Error("Not allowed to reschedule this appointment");
    }
  }

  const originalStartMinutes = parseTimeToMinutes(appointment.startTime, "startTime");
  const originalStart = new Date(
    new Date(appointment.appointmentDate).getTime() + originalStartMinutes * 60000,
  );
  if (new Date() >= originalStart) {
    throw new Error("Cannot reschedule after the appointment start time");
  }

  const hasServiceUpdate =
    Object.prototype.hasOwnProperty.call(payload, "serviceId") ||
    Object.prototype.hasOwnProperty.call(payload, "serviceIds");

  const resolvedServiceIds = hasServiceUpdate
    ? toServiceIdList(payload)
    : appointment.serviceIds;

  if (resolvedServiceIds.length > MAX_SERVICE_PER_APPOINTMENT) {
    throw new Error(`Maximum ${MAX_SERVICE_PER_APPOINTMENT} services per appointment`);
  }

  const totalDuration = await getTotalDuration(resolvedServiceIds);
  if (totalDuration > MAX_TOTAL_DURATION) {
    throw new Error(`Total duration must be <= ${MAX_TOTAL_DURATION} minutes`);
  }

  const nextStaffId = staffId || appointment.staffId;
  const nextStartMinutes =
    startTime !== undefined
      ? parseTimeToMinutes(startTime, "startTime")
      : parseTimeToMinutes(appointment.startTime, "startTime");
  const nextDateInput = appointmentDate || appointment.appointmentDate;

  if (nextStartMinutes % SLOT_STEP !== 0) {
    throw new Error("Start time must be aligned to 15-minute slots");
  }

  const { dayStart, dayEnd } = normalizeDay(nextDateInput);
  const todayStart = getTodayStart();
  const latestAllowed = new Date(todayStart);
  latestAllowed.setDate(latestAllowed.getDate() + MAX_DAYS_AHEAD);
  if (dayStart > latestAllowed) {
    throw new Error(`Appointment date must be within ${MAX_DAYS_AHEAD} days`);
  }
  if (isSameDay(dayStart, todayStart)) {
    const minStart = getCurrentMinuteOfDay() + MIN_BOOKING_LEAD_MINUTES;
    if (nextStartMinutes < minStart) {
      throw new Error(`Appointments must be booked at least ${MIN_BOOKING_LEAD_MINUTES} minutes in advance`);
    }
  }

  const { openMinute, closeMinute } = await getBusinessHours();
  const nextEndMinutes = nextStartMinutes + totalDuration;
  if (nextStartMinutes < openMinute || nextEndMinutes > closeMinute) {
    throw new Error("Selected time is outside working hours");
  }

  const staffAppointments = await Appointment.find({
    staffId: nextStaffId,
    appointmentDate: { $gte: dayStart, $lt: dayEnd },
    status: { $nin: ["Cancelled"] },
    _id: { $ne: appointment._id },
  });
  const staffOverlap = staffAppointments.some((item) =>
    isOverlap(
      nextStartMinutes,
      nextEndMinutes,
      parseTimeToMinutes(item.startTime, "startTime"),
      parseTimeToMinutes(item.endTime, "endTime"),
    )
  );
  if (staffOverlap) {
    throw new Error("Selected slot conflicts with existing appointments");
  }

  if (appointment.customerId) {
    const customerAppointments = await Appointment.find({
      customerId: appointment.customerId,
      appointmentDate: { $gte: dayStart, $lt: dayEnd },
      status: { $nin: ["Cancelled"] },
      _id: { $ne: appointment._id },
    });
    const customerOverlap = customerAppointments.some((item) =>
      isOverlap(
        nextStartMinutes,
        nextEndMinutes,
        parseTimeToMinutes(item.startTime, "startTime"),
        parseTimeToMinutes(item.endTime, "endTime"),
      )
    );
    if (customerOverlap) {
      throw new Error("You already have an appointment at this time");
    }
  }

  appointment.staffId = nextStaffId;
  appointment.appointmentDate = dayStart;
  appointment.startTime = formatMinutesToTime(nextStartMinutes);
  appointment.endTime = formatMinutesToTime(nextEndMinutes);
  appointment.serviceIds = resolvedServiceIds;
  appointment.staffBusySlots = [{ startMinute: nextStartMinutes, endMinute: nextEndMinutes }];

  if (Object.prototype.hasOwnProperty.call(payload, "note")) {
    appointment.note = note;
  }

  await appointment.save();
  return appointment;
};
