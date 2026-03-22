import Rate from '../models/Rate.model.js';
import Appointment from '../models/Appointment.model.js';
import Staff from '../models/Staff.model.js';

export const CreateRate = async(req, res) => {
    try {
        const {appointmentId, rating, comment} = req.body;
        if (!appointmentId || rating === undefined) {
            return res.status(400).json({message: "appointmentId and rating are required"});
        }
        if (typeof rating !== "number" || rating < 1 || rating > 5) {
            return res.status(400).json({message: "Rating must be between 1 and 5"});
        }
        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({message: "Appointment not found"});
        }
        if (appointment.status === "Cancelled") {
            return res.status(400).json({message: "Cancelled appointments cannot be rated"});
        }
        if (appointment.status === "Scheduled") {
            return res.status(400).json({message: "Scheduled appointments cannot be rated"});
        }
        if (appointment.status !== "Completed") {
            const endAt = new Date(appointment.appointmentDate);
            endAt.setHours(0, 0, 0, 0);
            endAt.setMinutes(endAt.getMinutes() + appointment.endTime);
            if (new Date() < endAt) {
                return res.status(400).json({message: "Only completed appointments can be rated"});
            }
        }
        if (req.user?.id && String(appointment.customerId) !== String(req.user.id)) {
            return res.status(403).json({message: "Not allowed to rate this appointment"});
        }
        const existing = await Rate.findOne({appointmentId});
        if (existing) {
            return res.status(400).json({message: "Appointment already rated"});
       }
        const rate = new Rate({appointmentId, rating, comment});
        await rate.save();

        const staffDoc = await Staff.findOne({ userId: appointment.staffId });
        if (staffDoc) {
            const appointments = await Appointment.find({staffId: appointment.staffId});
            const appointmentIds = appointments.map(a => a._id);
            const rates = await Rate.find({appointmentId: {$in: appointmentIds}});
            if (rates.length > 0) {
                const average = rates.reduce((sum, r) => sum + r.rating, 0) / rates.length;
                staffDoc.rating = Math.round(average * 10) / 10;
                await staffDoc.save();
            }
        }

        return res.status(201).json({message: "Rate created successfully", rate});

   }
    catch(e){
        return res.status(400).json({message: "Create rate error", error: e.message});
   }

}

export const GetRateByAppointmentId = async(req, res) => {
    try{
        const {appointmentId} = req.params;
        const rate = await Rate.findOne({appointmentId});
        if (!rate) {
            return res.status(200).json(null);
       }
        return res.status(200).json(rate);
   }
    catch(e){
        return res.status(400).json({message: "Get rate error", error: e.message});
   }
};

export const GetRatesByStaffId = async(req, res) => {
    try{
        const {staffId} = req.params;
        const appointments = await Appointment.find({staffId});
        const appointmentIds = appointments.map(a => a._id);
        const rates = await Rate.find({appointmentId: {$in: appointmentIds}});
        return res.status(200).json(rates);
    }
    catch(e){
        return res.status(400).json({message: "Get rates error", error: e.message});
    }
}

export const GetStaffAverageRate = async(req, res) => {
    try{
        const {staffId} = req.params;
        const appointments = await Appointment.find({staffId});
        const appointmentIds = appointments.map(a => a._id);
        const rates = await Rate.find({appointmentId: {$in: appointmentIds}});
        if (rates.length === 0) {
            return res.status(404).json({message: "No ratings found for the specified staff member"});
        }
        const average = rates.reduce((sum, r) => sum + r.rating, 0) / rates.length;
        return res.status(200).json({average});

    }
    catch(e){
        return res.status(400).json({message: "Get average rate error", error: e.message});
    }
}

export const GetRecentFiveStarRates = async (req, res) => {
    try {
        const limit = Math.min(Math.max(Number(req.query.limit) || 3, 1), 10);
        const rates = await Rate.find({
            rating: 5,
            comment: { $exists: true, $ne: "" },
        })
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate({
                path: "appointmentId",
                populate: { path: "customerId", select: "fullName" },
            });

        const data = rates.map((rate) => ({
            _id: rate._id,
            rating: rate.rating,
            comment: rate.comment,
            createdAt: rate.createdAt,
            customerName:
                rate.appointmentId?.customerId?.fullName || "Anonymous",
        }));

        return res.status(200).json(data);
    } catch (e) {
        return res.status(400).json({ message: "Get recent rates error", error: e.message });
    }
};
