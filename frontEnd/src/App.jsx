import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";

import AppointmentPage from "./pages/AppointmentPage";
import Home from "./pages/Home";


import "./App.css";
import "./index.css";

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/appointment" element={<AppointmentPage />} />
        </Routes>
        <Footer />
      </div>
    </Router>

  );
}

export default App;