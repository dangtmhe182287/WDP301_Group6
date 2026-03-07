import Service from "../models/Service.model.js";
const Coupon = require("../models/Coupon");
const Service = require("../models/Service.model");

const calculateDiscountPrice = async (serviceId, userMembership) => {
  const service = await Service.findById(serviceId);

  if (!service) {
    throw new Error("Service not found");
  }

  let discountPercent = 0;

  if (userMembership === "gold") {
    discountPercent = 15;
  }

  if (userMembership === "diamond") {
    discountPercent = 30;
  }

  const finalPrice = service.price * (1 - discountPercent / 100);

  return {
    serviceName: service.name,
    originalPrice: service.price,
    discountPercent,
    finalPrice
  };
};

module.exports = {
  calculateDiscountPrice
};

export const getAllServices = async() =>{
    return Service.find().sort({createdAt: -1});
};

export const getServiceById = async (serviceId) => {
    const service = await Service.findById(serviceId);
    if(!service){
        throw new Error("Service not found");
    }
    return service;
}

export const createService = async ({name, price, duration, description, phases =[]}) =>{
    if(!name || price == undefined || duration == undefined || !description){
        throw new Error("Missising required fields");
    }
    return Service.create({
        name,
        price,
        duration,
        description,
        phases,
    });
};

export const updateService = async (serviceId, payload) => {
    const updateService = await Service.findByIdAndUpdate(serviceId, payload, {
        new: true,
        runValidators: true,
    });

    if(!updateService){
        throw new Error("Service not found");
    }

    return updateService;
};

export const deleteService = async (serviceId) => {
    const deletedService = await Service.findByIdAndDelete(serviceId);

    if(!deletedService){
        throw new Error("Service not found");
    }

    return deletedService;
};



