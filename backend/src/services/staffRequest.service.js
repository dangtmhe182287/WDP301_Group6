import StaffRequest from "../models/StaffRequest.js";
import User from "../models/User.model.js";



  // user gửi request
  export const createRequest= async (userId, data)=> {
    const existed = await StaffRequest.findOne({userId, status: "pending"});
    if(existed) throw new Error("You already have a pending request")
    const newStaffRequest = await StaffRequest.create({
    userId: userId,
    speciality: data.speciality,
    certificate: {
      name: data.certificate.name,
      organization: data.certificate.organization,
      certificateId : data.certificate.certificateId,
      image: data.certificate.image
    },
    portfolio: data.portfolio,
    status: "pending",
    adminNote: ""
    })
    return newStaffRequest;
}

export const getAllRequest = async () =>{
  const requests = await StaffRequest.find().populate("userId", "fullName email");
  return requests;
}