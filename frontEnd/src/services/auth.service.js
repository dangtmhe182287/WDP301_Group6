import axiosInstance from "../utils/axiosInstance";

/**
 * Authentication Service
 * Xử lý tất cả các API calls liên quan đến authentication
 */
export const authService = {
  login: async (email, password) => {
    try {
      const response = await axiosInstance.post("/auth/login", {
        email,
        password,
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login Failed!",
        error,
      };
    }
  },

  register: async (userData) => {
    try {
      const response = await axiosInstance.post("/auth/register", userData);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Register Failed!",
        error,
      };
    }
  },

  refreshToken: async () => {
    try {
      const response = await axiosInstance.post("/auth/refreshToken");

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Refresh token Failed!",
        error,
      };
    }
  },

  logout: async () => {
    try {
      const response = await axiosInstance.post("/auth/logout");

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Logout Failed!",
        error,
      };
    }
  },

  /**
   * Kiểm tra session hiện tại
   */
  checkSession: async () => {
    try {
      const response = await axiosInstance.post("/auth/refreshToken");

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 400) {
        return {
          success: false,
          message: "No active session",
        };
      }

      throw error;
    }
  },
};

export default authService;