import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";

import AppointmentPage from "./pages/AppointmentPage";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Home from "./pages/Home";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "sonner";

import "./App.css";
import "./index.css";
import ForgotPassword from "./pages/Auth/ForgotPassword.jsx";
import ResetPassword from "./pages/Auth/ResetPassword.jsx";

function Layout() {
  const location = useLocation();

  const hideLayout =
    location.pathname === "/login" || location.pathname === "/register" || location.pathname === "/forgot-password";

  return (
    <>
      {!hideLayout && <Header />}

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword/>}/>
        <Route path="/reset-password/:token" element={<ResetPassword/>}/>
        <Route path="/" element={<Home/>} />
        <Route path="/appointment" element={<AppointmentPage />} />
      </Routes>

      {!hideLayout && <Footer />}
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <Layout />
          <Toaster />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;