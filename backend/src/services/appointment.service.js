import Appointment from "../models/Appointment.model.js";
import Service from "../models/Service.model.js";

// Booking uses 15-minute blocks, working hours 09:00 - 18:00.
const SLOT_STEP = 15;
const OPEN_MINUTE = 9 * 60;
const CLOSE_MINUTE = 18 * 60;

// Convert date input to day start and end
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

const isOverlap = (startA, endA, startB, endB) => Math.max(startA, startB) < Math.min(endA, endB);//Overlap if end of one is after start of the other.

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
  const {// Required fields: staffId, appointmentDate, startTime. Optional: customerId, walkInCustomerName, note.
    customerId,
    walkInCustomerName,
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
  //backEnd validation to ensure start time is aligned to 15-minute slots.
  if (startTime % SLOT_STEP !== 0) {
    throw new Error("Start time must be aligned to 15-minute slots");
  }

  // Use total duration from selected services to reserve the block.
  const serviceIds = toServiceIdList(payload);
  const totalDuration = await getTotalDuration(serviceIds);
  const endTime = startTime + totalDuration;
  //Not in working hours
  if (startTime < OPEN_MINUTE || endTime > CLOSE_MINUTE) {
    throw new Error("Selected time is outside working hours");
  }
  //get appointment day(more than day start and less than day end)
  const { dayStart, dayEnd } = normalizeDay(appointmentDate);
  // Check for overlapping appointments for the staff on the same day.
  const staffAppointments = await Appointment.find({
    staffId,
    appointmentDate: { $gte: dayStart, $lt: dayEnd },
    status: { $nin: ["Cancelled"] },
  });
  // Check if the new appointment overlaps with any existing appointments for the staff.
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
      endMinute <= CLOSE_MINUTE && //not exceed working hours
      !staffAppointments.some((appointment) =>//not overlap
        isOverlap(minute, endMinute, appointment.startTime, appointment.endTime)
      );

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
