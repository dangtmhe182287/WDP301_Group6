import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppointmentPage from "./pages/AppointmentPage";
import Home from "./pages/Home";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/appointment" element={<AppointmentPage />} />
      </Routes>
    </Router>
  );
}

export default App;