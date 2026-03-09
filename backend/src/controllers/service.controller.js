import * as serviceService from "../services/services.service.js";

export const GetAllServices = async (req, res) => {
    try{
        const services = await serviceService.getAllServices();
        res.status(200).json(services);
    }catch (error) {
        res.status(400).json({message: "Get all service errror!", error: error.message });
    }
};

export const GetServiceById = async (req, res) => {
    try{
        const service = await serviceService.getServiceById();
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
        const service = await serviceService.updateService(req.params.id, req.id)
        res.status(200).json(service);
    }catch(error){
        res.status(400).json({message: "Update service error!", error: error.message });
    }
};

export const DeleteService = async (req, res) =>{
    try{
        await serviceService.deleteService(req.params.id);
        res.status(200).json({message: "Deleted service successful"});
    }catch(error){
        res.status(400).json({message: "Delete service errror", error: error.message });
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