import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function OauthSuccess(){
    const navigate = useNavigate();
    const {refreshToken} = useAuth();

    useEffect(() =>{
        const handleLogin = async () =>{
            try {
                await new Promise(res => setTimeout(res, 300)) // delay 
                await refreshToken(); // Lay user tu cookie
                navigate("/");
            } catch (error) {
                navigate("/login");
            }
        }
        handleLogin();
    },[]);
    return <div>Loggin in...</div>
}