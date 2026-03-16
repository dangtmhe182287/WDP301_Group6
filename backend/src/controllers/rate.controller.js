import Rate from '../models/Rate.model.js';
import Appointment from '../models/Appointment.model.js';

export const CreateRate = async(req, res) => {
    try {
        const {appointmentId, rating, comment} = req.body;
        const existing = await Rate.findOne({appointmentId});
        if (existing) {
            return res.status(400).json({message: "Appointment already rated"});
       }
        const rate = new Rate({appointmentId, rating, comment});
        await rate.save();
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
            return res.status(404).json({message: "Rate not found"});
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