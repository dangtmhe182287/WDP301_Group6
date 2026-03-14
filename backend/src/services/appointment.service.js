import Appointment from "../models/Appointment.model.js";
import Service from "../models/Service.model.js";

// Booking uses 15-minute blocks, working hours 09:00 - 18:00.
const SLOT_STEP = 15;
const OPEN_MINUTE = 9 * 60;
const CLOSE_MINUTE = 18 * 60;

// Normalize date to start-of-day for queries in a single calendar day.
const normalizeDay = (dateInput) => {
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid appointment date");
  }

  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);

  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  return { dayStart, dayEnd };
};

const isOverlap = (startA, endA, startB, endB) => Math.max(startA, startB) < Math.min(endA, endB);

// Supports both serviceId (single) and serviceIds (multiple).
const toServiceIdList = (payload) => {
  if (payload.serviceId) {
    return [payload.serviceId];
  }

  if (Array.isArray(payload.serviceIds) && payload.serviceIds.length > 0) {
    return payload.serviceIds;
  }

  throw new Error("At least one service is required");
};

const parseServiceIds = (query) => {
  if (query.serviceId) {
    return [query.serviceId];
  }

  if (typeof query.serviceIds === "string") {
    const splitIds = query.serviceIds
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);
    if (splitIds.length > 0) {
      return splitIds;
    }
  }

  if (Array.isArray(query.serviceIds) && query.serviceIds.length > 0) {
    return query.serviceIds;
  }

  return [];
};

const getTotalDuration = async (serviceIds) => {
  const services = await Service.find({ _id: { $in: serviceIds } });
  if (services.length !== serviceIds.length) {
    throw new Error("One or more services not found");
  }

  return services.reduce((total, service) => total + service.duration, 0);
};

export const createAppointment = async (payload) => {
  const {
    customerId,
    walkInCustomerName,
    staffId,
    bookingChannel = "online",
    createdByRole = "customer",
    appointmentDate,
    startTime,
    note,
  } = payload;

  if (!staffId || !appointmentDate || startTime === undefined) {
    throw new Error("Missing required booking fields");
  }

  if (startTime % SLOT_STEP !== 0) {
    throw new Error("Start time must be aligned to 15-minute slots");
  }

  // Use total duration from selected services to reserve the block.
  const serviceIds = toServiceIdList(payload);
  const totalDuration = await getTotalDuration(serviceIds);
  const endTime = startTime + totalDuration;

  if (startTime < OPEN_MINUTE || endTime > CLOSE_MINUTE) {
    throw new Error("Selected time is outside working hours");
  }

  const { dayStart, dayEnd } = normalizeDay(appointmentDate);

  const staffAppointments = await Appointment.find({
    staffId,
    appointmentDate: { $gte: dayStart, $lt: dayEnd },
    status: { $nin: ["Cancelled"] },
  });

  const overlapped = staffAppointments.some((appointment) =>
    isOverlap(startTime, endTime, appointment.startTime, appointment.endTime)
  );

  if (overlapped) {
    throw new Error("Selected slot conflicts with existing appointments");
  }

  return Appointment.create({
    customerId,
    walkInCustomerName,
    staffId,
    serviceIds,
    bookingChannel,
    createdByRole,
    appointmentDate: dayStart,
    startTime,
    endTime,
    note,
    staffBusySlots: [{ startMinute: startTime, endMinute: endTime }],
  });
};

export const getAvailableSlots = async ({ staffId, appointmentDate, serviceId, serviceIds }) => {
  if (!staffId || !appointmentDate) {
    throw new Error("staffId and appointmentDate are required");
  }

  const resolvedServiceIds = parseServiceIds({ serviceId, serviceIds });
  if (resolvedServiceIds.length === 0) {
    throw new Error("At least one service is required");
  }

  const totalDuration = await getTotalDuration(resolvedServiceIds);
  const { dayStart, dayEnd } = normalizeDay(appointmentDate);

  const staffAppointments = await Appointment.find({
    staffId,
    appointmentDate: { $gte: dayStart, $lt: dayEnd },
    status: { $nin: ["Cancelled"] },
  }).select("startTime endTime");

  const slots = [];
  // Each slot is available only if full duration fits and does not overlap.
  for (let minute = OPEN_MINUTE; minute < CLOSE_MINUTE; minute += SLOT_STEP) {
    const endMinute = minute + totalDuration;
    const available =
      endMinute <= CLOSE_MINUTE &&
      !staffAppointments.some((appointment) =>
        isOverlap(minute, endMinute, appointment.startTime, appointment.endTime)
      );

    slots.push({
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
