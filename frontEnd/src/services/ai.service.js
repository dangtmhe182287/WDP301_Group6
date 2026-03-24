import axiosInstance from "@/utils/axiosInstance";

export const aiService = {
  chat: (message, history) =>
    axiosInstance.post("/ai/chat", { message, history }),
};