import * as StaffRequest from "../services/staffRequest.service.js"

export const applyStaffRequest = async(req, res)=>{
    try {
        const userId = req.user.id;
        const request = await StaffRequest.createRequest(userId, req.body);
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
        const requests = await StaffRequest.getAllRequest();
        res.status(201).json(requests);
    } catch (error) {
        res.status(400).json({message: error.message})
    }
}