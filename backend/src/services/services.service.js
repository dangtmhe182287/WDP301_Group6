import Service from "../models/Service.model.js";
import Category from "../models/Category.model.js";
import coupon from "../models/Coupon.js";

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

export const getAllServices = async ({ includeInactive = false } = {}) =>{
    const query = includeInactive ? {} : { isActive: { $ne: false } };
    return Service.find(query)
      .populate("categoryId", "name")
      .sort({createdAt: -1});
};

export const getServiceById = async (serviceId) => {
    const service = await Service.findById(serviceId).populate("categoryId", "name");
    if(!service){
        throw new Error("Service not found");
    }
    return service;
}

export const createService = async ({name, price, duration, description, categoryId, isFeatured, phases =[]}) =>{
    if(!name || price == undefined || duration == undefined || !description){
        throw new Error("Missising required fields");
    }
    if(!categoryId){
        throw new Error("Category is required");
    }

    const category = await Category.findById(categoryId);
    if(!category){
        throw new Error("Category not found");
    }

    return Service.create({
        name,
        price,
        duration,
        description,
        categoryId,
        isFeatured: Boolean(isFeatured),
        isActive: true,
        phases,
    });
};

export const updateService = async (serviceId, payload) => {
    if(Object.prototype.hasOwnProperty.call(payload, "categoryId")){
        if(!payload.categoryId){
            throw new Error("Category is required");
        }
        const category = await Category.findById(payload.categoryId);
        if(!category){
            throw new Error("Category not found");
        }
    }

    const updateService = await Service.findByIdAndUpdate(serviceId, payload, {
        new: true,
        runValidators: true,
    });

    if(!updateService){
        throw new Error("Service not found");
    }

    return updateService;
};

export const setServiceActive = async (serviceId, isActive) => {
    const updatedService = await Service.findByIdAndUpdate(
        serviceId,
        { isActive: Boolean(isActive) },
        { new: true, runValidators: true },
    );

    if(!updatedService){
        throw new Error("Service not found");
    }

    return updatedService;
};



