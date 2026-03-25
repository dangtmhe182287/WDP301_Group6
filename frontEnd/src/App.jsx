import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, useNavigate } from "react-router-dom";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import { useEffect } from "react";

import AppointmentPage from "./pages/AppointmentPage";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Home from "./pages/Home";
import Settings from "./pages/Settings";
import MyBooking from "./pages/MyBooking";
import Admin from "./pages/Admin";
import Staff from "./pages/Staff.jsx";
import About from "./pages/About";
import ServicesPage from "./pages/ServicesPage";
import { useAuth } from "./context/AuthContext";
import { Toaster } from "sonner";
import Schedule from "./pages/Staff/Schedule.jsx";
import Dashboard from "./pages/Staff/Dashboard.jsx";
import Appointments from "./pages/Staff/Appointments.jsx";
import CustomerDetail from "./pages/Staff/CustomerDetail.jsx";
import "./App.css";
import "./index.css";
import { Skeleton } from "./components/ui/skeleton.jsx";
import ForgotPassword from "./pages/Auth/ForgotPassword.jsx";
import ResetPassword from "./pages/Auth/ResetPassword.jsx";
import ChatBubble from "./components/ChatBubble";


/* ================= Protected Route ================= */
function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading, authenticating } = useAuth();

  if (loading || authenticating) return null;

  // chưa login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // sai role
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const hideLayout =
    location.pathname.startsWith("/login") ||
    location.pathname.startsWith("/register") ||
    location.pathname.startsWith("/forgot-password") ||
    location.pathname.startsWith("/reset-password") ||
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/staff");
    useEffect(() => {
    if (!user) return;

    if (user.role === "staff" && location.pathname === "/") {
      navigate("/staff/dashboard");
    }

    if (user.role === "admin" && location.pathname === "/") {
      navigate("/admin");
    }
  }, [user, location.pathname]);

  return (
    <>
      {!hideLayout && <Header />}

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword/>}/>
        <Route path="/reset-password/:token" element={<ResetPassword/>}/>
        <Route
          path="/"
          element={
            user?.role === "staff" ? (
              <Navigate to="/staff" />
            ) : user?.role === "admin" ? (
              <Navigate to="/admin" />
            ) : (
              <About />
            )
          }
        />
        <Route path="/appointment" element={<AppointmentPage />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/my-bookings" element={<MyBooking />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route
          path="/admin/*"
          element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          }
        />
        <Route
          path="/staff/*"
          element={
            <StaffRoute>
              <Staff />
            </StaffRoute>
          }
        />
      </Routes>

      {!hideLayout && <Footer />}
      {!hideLayout && <ChatBubble />}
    </>
  );
}

function AdminRoute({ children }) {
  const { user, loading, authenticating } = useAuth();

  // While checking session or processing login, avoid flicker by not rendering anything
  if (loading || authenticating) return null;

  // Only admins can access Admin routes
  if (!user || user.role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function StaffRoute({ children }) {
  const { user, loading, authenticating } = useAuth();
  if (loading || authenticating) return null;
  if (!user || user.role !== "staff") return <Navigate to="/login" replace />;
  return children;
}

function App() {
  const { loading } = useAuth();

  // 🔥 LOADING FULL APP (SKELETON)
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f6f7]">

        {/* HEADER SKELETON */}
        <div className="flex items-center justify-between px-6 py-4 bg-white">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-64 hidden md:block" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>

        {/* CONTENT SKELETON */}
        <div className="p-6 space-y-4">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>

      </div>
    );
  }

  return (
    <Router>
      <div className="app">
        <Layout />
        <Toaster />
      </div>
    </Router>
  );
}

export default App;
