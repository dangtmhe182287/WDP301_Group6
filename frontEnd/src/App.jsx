import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";

import AppointmentPage from "./pages/AppointmentPage";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Home from "./pages/Home";
import Settings from "./pages/Settings";
import MyBooking from "./pages/MyBooking";
import Admin from "./pages/Admin";
import { useAuth } from "./context/AuthContext";
import { Toaster } from "sonner";

import "./App.css";
import "./index.css";
import ForgotPassword from "./pages/Auth/ForgotPassword.jsx";
import ResetPassword from "./pages/Auth/ResetPassword.jsx";
import OauthSuccess from "./pages/OauthSuccess.jsx";
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

  const hideLayout =
    location.pathname.startsWith("/login") ||
    location.pathname.startsWith("/register") ||
    location.pathname.startsWith("/forgot-password") ||
    location.pathname.startsWith("/reset-password") ||
    location.pathname.startsWith("/admin");

  return (
    <>
      {!hideLayout && <Header />}

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword/>}/>
        <Route path="/reset-password/:token" element={<ResetPassword/>}/>
        <Route path="/" element={<Home/>} />
        <Route path="/oauth-success" element={<OauthSuccess />} />
        <Route path="/appointment" element={<AppointmentPage />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/my-bookings" element={<MyBooking />} />
        <Route
          path="/admin/*"
          element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          }
        />
      </Routes>

      {!hideLayout && <Footer />}
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

function App() {
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
