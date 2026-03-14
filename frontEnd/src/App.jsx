import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppointmentPage from "./pages/AppointmentPage";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Home from "./pages/Home";
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'sonner';


function App() {
  return (
    <Router>
      <AuthProvider>

      <Routes>
        <Route path="/" element={<Home />} />
          {/* Public Routes */}
        <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

        <Route path="/appointment" element={<AppointmentPage />} />
      </Routes>
      </AuthProvider>

    </Router>
  );
}

export default App;