import axios from "axios"
import { response } from "express";

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_SERVER_API || "http://localhost:3000/api",
    withCredentials:true, // cho phép gửi cookie
    headers:{
        'Content-Type':'application/json'
    }
});
// Request interceptor - thêm access token vào header
axiosInstance.interceptors.request.use(
    (config)=>{
        // Lấy access token từ auth context ( sẽ dc inject khi dùng)
        const accessToken = window.__ACCESS_TOKEN__;
        if(accessToken){
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) =>{
        return Promise.reject(error);
    }
)

//  Response interceptor - tự động refresh token khi 401
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) =>{
    failedQueue.forEach(prom => {
        if(error) {
            prom.reject(error);
        }
        else prom.resolve(token);
    })
}

axiosInstance.interceptors.response.use(
    (response) => response,
    async(error) =>{
        const originalRequest = error.config;

        // Ko retry nếu là refresh-token endpoint để tránh loop
        
    }
)

