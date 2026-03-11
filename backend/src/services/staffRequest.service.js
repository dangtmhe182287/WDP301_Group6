import StaffRequest from "../models/StaffRequest";
import User from "../models/User.model";



  // user gửi request
  export const createRequest= async (userId, data)=> {

    const existing = await StaffRequest.findOne({
      userId,
      status: "pending"
    });

    if (existing) {
      throw new Error("You already have a pending request");
    }

    const request = await StaffRequest.create({
      userId,
      experienceYears: data.experienceYears,
      specialty: data.specialty,
      portfolioImages: data.portfolioImages,
      certificateImage: data.certificateImage,
      message: data.message
    });

    return request;
}