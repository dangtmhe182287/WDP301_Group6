import Coupon from "../models/Coupon.js";
import User from "../models/users.model.js";
import Service from "../models/Service.model.js";

export const calculatePrice = async (req, res) => {
    try {
        const userId = req.user?.userId || req.body.userId;
        const { serviceId, couponCode } = req.body;

        if (!serviceId) return res.status(400).json({ message: "serviceId is required" });

        const [service, user] = await Promise.all([
            Service.findById(serviceId),
            userId ? User.findById(userId) : null
        ]);

        if (!service) return res.status(404).json({ message: "Service not found" });

        let coupon = null;
        if (couponCode) {
            coupon = await Coupon.findOne({ code: couponCode, serviceId });
        } else if (user) {
            coupon = await Coupon.findOne({ membershipType: user.membershipType, serviceId });
        }

        let appliedDiscountPercent = 0;

        if (coupon && typeof coupon.percent === 'number') {
            appliedDiscountPercent = coupon.percent;
        } else if (user && user.membershipType) {
            if (user.membershipType === 'gold') appliedDiscountPercent = 15;
            else if (user.membershipType === 'diamond') appliedDiscountPercent = 30;
        }

        const discountAmount = (service.price * appliedDiscountPercent) / 100;
        const finalPrice = service.price - discountAmount;

        res.json({
            servicePrice: service.price,
            discount: appliedDiscountPercent,
            finalPrice
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};