import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
 export default function ProtectedRoute ({children, allowedRoles}){
    const {user, loading} = useAuth();
    if(loading) return <div>Loading...</div>;
    // chưa login 
    if(!user){
        return <Navigate to="/login"/>
    }
    // sai role
    if(!allowedRoles.includes(user.role)){
        return <Navigate to="/"/>;
    }
    return children;
 }