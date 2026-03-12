import StaffRequest from "../models/StaffRequest.js";
import Staff from "../models/Staff.model.js"
import User from "../models/User.model.js"



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
  const requests = await StaffRequest.find().populate("userId", "fullName email phone");
  return requests;
}

export const approveRequest = async(requestId, adminNote) =>{
  const request = await StaffRequest.findById(requestId);
  const existedStaff = await Staff.findOne({userId: request.userId});
  if(!request) throw new Error("Request not found");
  if(request.status !== "pending") {
    throw new Error("Request already processed");
  }
   if(existedStaff){
    throw new Error("User already a staff");
  }
  request.status = "approved";
  request.adminNote = adminNote;
  await request.save();
  await User.findByIdAndUpdate(request.userId, {
    role: "staff"
  });
 
  const newStaff = await Staff.create({
    userId: request.userId,
    speciality: request.speciality,
    portfolio: request.portfolio
  })
  return {request, 
    staff: newStaff
  };
}
export const rejectRequest = async(requestId, adminNote) =>{
  const request = await StaffRequest.findById(requestId);
  if(!request) throw new Error("Request not found");
   if(request.status !== "pending") {
    throw new Error("Request already processed");
  }
   if(existedStaff){
    throw new Error("User already a staff");
  }
  request.status = "rejected";
  request.adminNote = adminNote;
  await request.save();
  return request;
}