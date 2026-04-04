import * as serviceService from "../services/services.service.js";
import Appointment from "../models/Appointment.model.js";
import Rate from "../models/Rate.model.js";

export const GetAllServices = async (req, res) => {
    try{
        const includeInactive = String(req.query.includeInactive || "false").toLowerCase() === "true";
        const services = await serviceService.getAllServices({ includeInactive });
        res.status(200).json(services);
    }catch (error) {
        res.status(400).json({message: "Get all service errror!", error: error.message });
    }
};

export const GetServiceById = async (req, res) => {
    try{
        const service = await serviceService.getServiceById(req.params.id);
        res.status(200).json(service);
    }catch (error){
        res.status(400).json({message: "Get service by id error!", error: error.message });
    }
};

export const CreateService = async (req, res) => {
    try{
        const service = await serviceService.createService(req.body);
        res.status(201).json(service);
    }catch(error){
        res.status(400).json({message: "Create service error!", error: error.message });
    }
};

export const UpdateService = async (req, res) => {
    try{
        const service = await serviceService.updateService(req.params.id, req.body)
        res.status(200).json(service);
    }catch(error){
        res.status(400).json({message: "Update service error!", error: error.message });
    }
};

export const InactivateService = async (req, res) =>{
    try{
        const service = await serviceService.setServiceActive(req.params.id, false);
        res.status(200).json({message: "Service inactivated successfully", service});
    }catch(error){
        res.status(400).json({message: "Inactivate service error", error: error.message });
    }
};

export const ActivateService = async (req, res) =>{
    try{
        const service = await serviceService.setServiceActive(req.params.id, true);
        res.status(200).json({message: "Service activated successfully", service});
    }catch(error){
        res.status(400).json({message: "Activate service error", error: error.message });
    }
};


export const checkoutService = async (req, res) => {
  try {

    const { serviceId } = req.body;

    const user = req.user; // lấy từ middleware auth

    const result = await serviceService.calculateDiscountPrice(
      serviceId,
      user.membershipLevel
    );

    res.status(200).json({
      message: "Checkout success",
      data: result
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

export const GetServiceBookingStats = async (req, res) => {
    try {
        const stats = await Appointment.aggregate([
            { $unwind: "$serviceIds" },
            {
                $group: {
                    _id: "$serviceIds",
                    bookingCount: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: "services", 
                    localField: "_id",
                    foreignField: "_id",
                    as: "serviceDetails"
                }
            },
            { $unwind: "$serviceDetails" },
            {
                $project: {
                    _id: 1,
                    serviceName: "$serviceDetails.name",
                    price: "$serviceDetails.price",
                    bookingCount: 1
                }
            },
            { $sort: { bookingCount: -1 } }
        ]);

        res.status(200).json(stats);
    } catch (error) {
        res.status(400).json({ message: "Get service stats error!", error: error.message });
    }
};

export const GetServiceFeedbacks = async (req, res) => {
    try {
        const rates = await Rate.find().populate({
            path: "appointmentId",
            populate: [
                { path: "customerId", select: "fullName phone" },
                { path: "staffId", select: "fullName" },
                { path: "serviceIds", select: "name" }
            ]
        }).sort({ createdAt: -1 }).lean();

        const serviceFeedbacks = [];

        rates.forEach(rate => {
            const app = rate.appointmentId;
            if (!app) return;
            
            const services = Array.isArray(app.serviceIds) ? app.serviceIds : [];
            if (services.length === 0) {
                 serviceFeedbacks.push({
                     _id: rate._id,
                     rating: rate.rating,
                     comment: rate.comment,
                     createdAt: rate.createdAt,
                     serviceName: "N/A",
                     customerName: app.customerId?.fullName || app.customerName || "Anonymous",
                     customerPhone: app.customerId?.phone || "",
                     staffName: app.staffId?.fullName || "Unknown",
                 });
            } else {
                 services.forEach(service => {
                     serviceFeedbacks.push({
                         _id: `${rate._id}-${service._id}`,
                         rateId: rate._id,
                         rating: rate.rating,
                         comment: rate.comment,
                         createdAt: rate.createdAt,
                         serviceName: service.name,
                         customerName: app.customerId?.fullName || app.customerName || "Anonymous",
                         customerPhone: app.customerId?.phone || "",
                         staffName: app.staffId?.fullName || "Unknown",
                     });
                 });
            }
        });

        res.status(200).json(serviceFeedbacks);
    } catch (error) {
        res.status(400).json({ message: "Get service feedbacks error", error: error.message });
    }
};
