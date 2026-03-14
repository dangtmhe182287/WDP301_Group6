import axios from "axios"

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_SERVER_API || "http://localhost:3000",
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
        if(originalRequest.url?.includes('/auth/refreshToken')){
            return Promise.reject(error)
        }
        // Nếu lỗi 401 và chưa retry
        if(error.response?.status === 401 && !originalRequest._retry){
            if(isRefreshing){
                // Đang refresh, đưa request vào queue
                return new Promise((resolve, reject) =>{
                    failedQueue.push({resolve, reject});
                }).then(token =>{
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return axiosInstance(originalRequest);
                }).catch(err =>{
                    return Promise.reject(err);
                });
            }
            originalRequest._retry = true;
            isRefreshing = true;
            try {
    const response = await axiosInstance.post("/auth/refreshToken");

    const newToken = response.data.accessToken;

    window.__ACCESS_TOKEN__ = newToken;

    processQueue(null, newToken);

    originalRequest.headers.Authorization = `Bearer ${newToken}`;

    return axiosInstance(originalRequest);

} catch (refreshError) {

    processQueue(refreshError, null);

    window.__ACCESS_TOKEN__ = null;

    if(window.location.pathname !== "/login"){
        window.location.href = "/login";
    }

    return Promise.reject(refreshError);

} finally {
    isRefreshing = false;
}
        }
        return Promise.reject(error);
    }
)

export default axiosInstance;

// 1. Tạo axiosInstance
// 2. Tự động gắn accessToken vào request
// 3. Tự động refreshToken khi bị 401