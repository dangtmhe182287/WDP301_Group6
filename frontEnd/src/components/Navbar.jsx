import { Link } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">BLOCKY BARBER</div>

      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/booking">Booking</Link>
        <Link to="/history">History</Link>
        <Link to="/login">Login</Link>
      </div>
    </nav>
  );
}
