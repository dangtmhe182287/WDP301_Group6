import * as StaffRequestService from "../services/staffRequest.service.js"

export const applyStaffRequest = async(req, res)=>{
    try {
        const userId = req.user.id;
        const request = await StaffRequestService.createRequest(userId, req.body);
        res.status(201).json({
            message: "Request sent successfully",
            data: request
        })
    } catch (error) {
        res.status(400).json({message: error.message})
    }

}
export const getRequests = async(req, res) =>{
    try {
        const requests = await StaffRequestService.getAllRequest();
        res.status(201).json(requests);
    } catch (error) {
        res.status(400).json({message: error.message})
    }
}
export const rejectStaffRequest = async(req, res)=>{
    try {
        console.log("PARAM ID:", req.params.id);
        const {request, staff} = await StaffRequestService.rejectRequest(
            req.params.id,
            req.body.adminNote
        )
        res.status(200).json({
            message: "Request rejected",
            request, staff
        })
    } catch (error) {
        res.status(400).json({message: error.message});
    }
}
export const approveStaffRequest = async(req, res)=>{
    try {
        console.log("ID:", req.params.id);
console.log("NOTE:", req.body.adminNote);
        const request = await StaffRequestService.approveRequest(
            req.params.id,
            req.body.adminNote
        )
        res.status(200).json({message: "Request approved",
            data: request
        })
    } catch (error) {
        res.status(400).json({message: error.message});
    }
}