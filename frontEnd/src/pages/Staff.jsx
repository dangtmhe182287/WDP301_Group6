import React from "react";
import { Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import DashboardView from "./Staff/Dashboard";
import Appointments from "./Staff/Appointments";
import ScheduleView from "./Staff/Schedule";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";


export default function Staff() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { label: "Dashboard", path: "/staff" },
    { label: "Appointments", path: "/staff/appointments" },
    { label: "Schedule", path: "/staff/schedule" },
  ];

  const isActive = (path) =>
    path === "/staff"
      ? location.pathname === "/staff"
      : location.pathname.startsWith(path);

  return (
    <div className="flex min-h-screen bg-muted/40">
      
      {/* Sidebar */}
      <aside className="w-64 border-r bg-white p-5">
        <h2 className="text-xl font-bold mb-6">Staff</h2>

        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`block px-3 py-2 rounded-lg text-sm ${
                isActive(item.path)
                  ? "bg-primary text-white"
                  : "hover:bg-muted"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        
        {/* Header */}
        <header className="flex items-center justify-between border-b bg-white px-6 py-3">
          <Input placeholder="Search..." className="max-w-sm" />

          <div className="flex items-center gap-3">
            <span className="text-sm">
              {user?.fullName || user?.email}
            </span>
            <Button variant="outline" onClick={logout}>
              Logout
            </Button>
          </div>
        </header>

        {/* Content */}
        <main className="p-6 flex-1">
          <Routes>
            <Route index element={<DashboardView />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="schedule" element={<ScheduleView />} />
            <Route path="*" element={<Navigate to="." replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}