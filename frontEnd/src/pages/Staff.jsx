import React from "react";
import { Routes, Route, Navigate, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import DashboardView from "./Staff/Dashboard";
import Appointments from "./Staff/Appointments";
import ScheduleView from "./Staff/Schedule";
import CustomerDetail from "./Staff/CustomerDetail";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  CalendarCheck,
  Clock3,
  Home,
  LogOut,
  Sparkles,
} from "lucide-react";

export default function Staff() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    {
      label: "Dashboard",
      path: "/staff/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Appointments",
      path: "/staff/appointments",
      icon: CalendarCheck,
    },
    {
      label: "Schedule",
      path: "/staff/schedule",
      icon: Clock3,
    },
  ];

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="w-72 border-r bg-background/95 backdrop-blur">
        <div className="flex h-full flex-col p-5">
          {/* Brand */}
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate("/about")}
                className="inline-flex h-11 items-center rounded-2xl border bg-background px-4 text-lg font-bold tracking-tight shadow-sm transition hover:bg-muted"
              >
                elysina.
              </button>

              <div className="min-w-0">
                <h2 className="text-lg font-semibold tracking-tight">Staff</h2>
                <p className="text-xs text-muted-foreground">
                  Internal workspace
                </p>
              </div>
            </div>
          </div>

          {/* Welcome Card */}
          <div className="mb-6 rounded-3xl border bg-gradient-to-br from-primary/10 via-background to-background p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <div className="rounded-xl bg-primary/10 p-2">
                <Sparkles className="h-4 w-4" />
              </div>
              <Badge variant="secondary" className="rounded-full">
                Staff Panel
              </Badge>
            </div>

            <p className="text-sm font-medium">
              Welcome back, {user?.fullName || "Staff"}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Manage schedules, appointments, and customer details from one
              place.
            </p>

            <button
              type="button"
              onClick={() => navigate("/about")}
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary transition hover:underline"
            >
              <Home className="h-4 w-4" />
              Go to homepage
            </button>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Navigation
            </p>

            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Bottom */}
          <div className="mt-auto pt-6">
            <div className="rounded-2xl border bg-muted/30 p-4">
              <p className="text-xs text-muted-foreground">Signed in as</p>
              <p className="mt-1 truncate text-sm font-medium">
                {user?.fullName || user?.email}
              </p>

              <Button
                variant="outline"
                onClick={logout}
                className="mt-4 w-full justify-center rounded-xl"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b bg-background/80 px-6 py-4 backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Staff workspace</p>
              <h1 className="text-xl font-semibold tracking-tight">
                {location.pathname.startsWith("/staff/dashboard") && "Dashboard"}
                {location.pathname.startsWith("/staff/appointments") &&
                  "Appointments"}
                {location.pathname.startsWith("/staff/schedule") && "Schedule"}
                {location.pathname.startsWith("/staff/customer/") &&
                  "Customer Detail"}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="outline" className="rounded-full px-3 py-1">
                {user?.role || "staff"}
              </Badge>
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium">
                  {user?.fullName || user?.email}
                </p>
                <p className="text-xs text-muted-foreground">Staff account</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">
          <div className="mx-auto max-w-7xl">
            <Routes>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<DashboardView />} />
              <Route path="appointments" element={<Appointments />} />
              <Route path="schedule" element={<ScheduleView />} />
              <Route path="customer/:id" element={<CustomerDetail />} />
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}