import axiosInstance from "@/utils/axiosInstance";
export const staffService = {
    getAppointments: () => axiosInstance.get("/staffs/appointments"),

    updateStatus: (id, status) => 
        axiosInstance.put(`/staffs/appointments/${id}`, {status}),

    getSchedule: () => axiosInstance.get("/staffs/schedule"),

    updateSchedule: (schedule) =>
        axiosInstance.put("/staffs/schedule", {schedule}),

    getCustomer: (id) =>
        axiosInstance.get(`/staffs/customer/${id}`),

    getDashboard: () => axiosInstance.get("/staffs/dashboard"),
};