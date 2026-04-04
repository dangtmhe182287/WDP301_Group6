import React from "react";
import { Link, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Stylists from "./Stylists";
import Services from "./Services";
import StaffRequests from "./StaffRequests";
import Analytics from "./Analytics";
import Members from "./Members";
import AdminAppointments from "./AdminAppointments";
import AdminSettings from "./AdminSettings";
import AdminFeedback from "./AdminFeedback";
import AdminSchedules from "./AdminSchedules";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  Users,
  Scissors,
  Clock3,
  Wallet,
  LayoutDashboard,
  UserCog,
  BriefcaseBusiness,
  CalendarDays,
  UserRound,
  MessageSquareText,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";

function DashboardView() {
  const [stats, setStats] = React.useState({
    totalCustomers: 0,
    totalStaff: 0,
    totalAppointments: 0,
    pendingAppointments: 0,
    totalRevenue: 0,
  });

  React.useEffect(() => {
    fetch("http://localhost:3000/users/admin/dashboard-stats")
      .then((res) => res.json())
      .then((data) => {
        if (!data.message) setStats(data);
      })
      .catch(console.error);
  }, []);

  const statItems = [
    {
      title: "Customers",
      value: stats.totalCustomers,
      icon: Users,
      description: "Total registered customers",
    },
    {
      title: "Staff",
      value: stats.totalStaff,
      icon: Scissors,
      description: "Total active stylists",
    },
    {
      title: "Pending appointments",
      value: stats.pendingAppointments,
      icon: Clock3,
      description: "Appointments waiting confirmation",
    },
    {
      title: "Estimated revenue",
      value: `${stats.totalRevenue ? stats.totalRevenue.toLocaleString("en-US") : "0"} VND`,
      icon: Wallet,
      description: "Current revenue overview",
    },
  ];

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h2>
        <p className="mt-1 text-sm text-slate-500">
          Overview of salon operations and key numbers.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {statItems.map((item) => {
          const Icon = item.icon;
          return (
            <Card
              key={item.title}
              className="rounded-2xl border-slate-200 shadow-sm transition-all hover:-translate-y-1 hover:border-teal-400/60 hover:shadow-lg"
            >
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-400/10 text-teal-500">
                  <Icon className="h-7 w-7" />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-500">{item.title}</p>
                  <p className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
                    {item.value}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">{item.description}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-900">Detailed Management</CardTitle>
          <CardDescription>
            Switch to the Appointments, Analytics, or other sections in the sidebar to manage
            detailed data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
            Use the left menu to navigate between staff, services, appointments, members, feedback,
            analytics, and website settings.
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

function AdminNavItem({ to, icon: Icon, children }) {
  const location = useLocation();
  const isActive =
    to === "/admin"
      ? location.pathname === "/admin"
      : location.pathname === to || location.pathname.startsWith(`${to}/`);

  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
        isActive
          ? "bg-teal-400 text-slate-950 shadow-sm"
          : "text-slate-300 hover:bg-white/10 hover:text-teal-300"
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{children}</span>
    </Link>
  );
}

export default function Admin() {
const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/staff", label: "Staff", icon: UserCog },
  { to: "/admin/services", label: "Services", icon: BriefcaseBusiness },
  { to: "/admin/staff-requests", label: "Staff Requests", icon: Clock3 },
  { to: "/admin/appointments", label: "Appointments", icon: CalendarDays },
  { to: "/admin/schedules", label: "Schedules", icon: CalendarDays },
  { to: "/admin/members", label: "Members", icon: UserRound },
  { to: "/admin/feedback", label: "Feedback", icon: MessageSquareText },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/settings", label: "Website Settings", icon: Settings },
];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="hidden w-72 shrink-0 border-r border-slate-800 bg-slate-950 lg:flex lg:flex-col">
        <div className="px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-400 text-slate-950 shadow-md">
              <Scissors className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-white">Admin</h1>
              <p className="text-xs text-slate-400">Salon management panel</p>
            </div>
          </div>
        </div>

        <Separator className="bg-white/10" />

        <ScrollArea className="flex-1 px-4 py-4">
          <nav className="space-y-2">
            {navItems.map((item) => (
              <AdminNavItem key={item.to} to={item.to} icon={item.icon}>
                {item.label}
              </AdminNavItem>
            ))}
          </nav>
        </ScrollArea>

        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-3">
            <Avatar className="h-10 w-10 border border-white/10">
              <AvatarFallback className="bg-teal-400 text-slate-950 font-bold">
                AD
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">admin</p>
              <p className="text-xs text-slate-400">Administrator</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur">
          <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Admin Panel</h2>
              <p className="text-sm text-slate-500">Manage your salon system efficiently</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm sm:block">
                admin
              </div>
              <Button
                onClick={handleLogout}
                className="rounded-xl bg-teal-400 text-slate-950 hover:bg-teal-500"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </Button>
            </div>
          </div>
        </header>

        {/* Mobile nav */}
        <div className="border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
         <Routes>
  <Route index element={<DashboardView />} />
  <Route path="staff" element={<Stylists />} />
  <Route path="services" element={<Services />} />
  <Route path="staff-requests" element={<StaffRequests />} />
  <Route path="appointments" element={<AdminAppointments />} />
  <Route path="schedules" element={<AdminSchedules />} />
  <Route path="members" element={<Members />} />
  <Route path="feedback" element={<AdminFeedback />} />
  <Route path="analytics" element={<Analytics />} />
  <Route path="settings" element={<AdminSettings />} />
  <Route path="*" element={<Navigate to="." replace />} />
</Routes>
        </div>
      </main>
    </div>
  );
}
