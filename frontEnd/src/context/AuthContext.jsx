import { useContext, useEffect, useState } from "react";
import { createContext } from "react"
const authContext = createContext(null);
export const AuthProvider = ({children}) =>{
    const [user, setUser] = useState(null);
    const [accessToken, setAccessToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isCheckingAuth, setIsCheckingAuth] = useState(false);
    // Sync Access Token for Axios Interceptor
    useEffect(() =>{
        window.__ACCESS_TOKEN__ = accessToken;
    },[accessToken]);

    // Refresh Session when loading
    
    useEffect(() => {
        CheckAuth();
    },[]);


    const CheckAuth = async() =>{
        if(isCheckingAuth) return;
        setIsCheckingAuth(true);
        try {
            // Refresh token checking session
        } catch (error) {
            
        }
    }


 }

export const useAuth = () =>{
    const context = useContext(authContext);
    if(!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}