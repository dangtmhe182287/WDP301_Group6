import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";
import "./MainLayout.css";

export default function MainLayout() {
  return (
    <div className="layout">
      <Navbar />
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
