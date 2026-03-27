import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";
import anonymousAvatar from "../assets/anomyous.jpg";

import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, User, CalendarDays, LogOut } from "lucide-react";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const API_BASE = import.meta.env.VITE_SERVER_API || "http://localhost:3000";

  const avatarSrc = user?.imgUrl
    ? user.imgUrl.startsWith("http")
      ? user.imgUrl
      : `${API_BASE}${user.imgUrl}`
    : anonymousAvatar;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navItems = [
    { label: "Home", path: "/" },
    { label: "Services", path: "/services" },
    { label: "About Us", path: "/about" },
  ];

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/70">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-3 transition-opacity hover:opacity-90"
        >
            <img
              src={logo}
              alt="logo"
              className="h-8 w-8 object-contain"
            />
          <div className="text-left">
            <p className="text-lg font-bold tracking-tight text-slate-900">
              Elysina.
            </p>
            <p className="text-xs text-slate-500">Beauty & Booking</p>
          </div>
        </button>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          <NavigationMenu>
            <NavigationMenuList className="gap-2">
              {navItems.map((item) => (
                <NavigationMenuItem key={item.path}>
                  <button
                    onClick={() => navigate(item.path)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                      isActive(item.path)
                        ? "bg-teal-50 text-teal-600"
                        : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    {item.label}
                  </button>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          {!user ? (
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="rounded-full px-5"
                onClick={() => navigate("/login")}
              >
                Log in
              </Button>
              <Button
                className="rounded-full px-5 bg-teal-500 hover:bg-teal-600"
                onClick={() => navigate("/register")}
              >
                Sign up
              </Button>
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-2 py-1.5 shadow-sm transition hover:shadow-md">
                  <Avatar className="h-10 w-10 border">
                    <AvatarImage src={avatarSrc} alt="avatar" />
                    <AvatarFallback>
                      {user?.fullName?.[0] || user?.name?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="hidden lg:block text-left pr-2">
                    <p className="text-sm font-semibold text-slate-900 leading-none">
                      {user?.fullName || user?.name || "User"}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Welcome back
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-56 rounded-xl p-2"
              >
                <DropdownMenuItem
                  className="cursor-pointer rounded-lg"
                  onClick={() => navigate("/my-bookings")}
                >
                  <CalendarDays className="mr-2 h-4 w-4" />
                  My Bookings
                </DropdownMenuItem>

                <DropdownMenuItem
                  className="cursor-pointer rounded-lg"
                  onClick={() => navigate("/settings")}
                >
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  className="cursor-pointer rounded-lg text-red-500 focus:text-red-500"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Mobile menu */}
        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56 rounded-xl p-2">
              {navItems.map((item) => (
                <DropdownMenuItem
                  key={item.path}
                  className="cursor-pointer rounded-lg"
                  onClick={() => navigate(item.path)}
                >
                  {item.label}
                </DropdownMenuItem>
              ))}

              <DropdownMenuSeparator />

              {!user ? (
                <>
                  <DropdownMenuItem
                    className="cursor-pointer rounded-lg"
                    onClick={() => navigate("/login")}
                  >
                    Log in
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer rounded-lg"
                    onClick={() => navigate("/register")}
                  >
                    Sign up
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem
                    className="cursor-pointer rounded-lg"
                    onClick={() => navigate("/my-bookings")}
                  >
                    My Bookings
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer rounded-lg"
                    onClick={() => navigate("/settings")}
                  >
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer rounded-lg text-red-500 focus:text-red-500"
                    onClick={handleLogout}
                  >
                    Log out
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}