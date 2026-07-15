import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Train,
  LayoutDashboard,
  Search,
  Ticket,
  Activity,
  ShieldAlert,
  FileText,
  Settings,
  LogOut
} from "lucide-react";
import logger from "../utils/logger";

const Sidebar = () => {
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logger.debug("Sidebar: Triggering logout");
    logout();
    navigate("/login");
  };

  const menuItems = [
    {
      to: "/dashboard",
      label: "Executive Dashboard",
      icon: LayoutDashboard,
    },
    {
      to: "/trains",
      label: "Train Search",
      icon: Search,
    },
    {
      to: "/my-bookings",
      label: "Booking History",
      icon: Ticket,
    },
    {
      to: "/dashboard", // Map to dashboard or dummy section
      label: "Live Status",
      icon: Activity,
    },
  ];

  if (isAdmin) {
    menuItems.push(
      {
        to: "/admin",
        label: "Admin Panel",
        icon: ShieldAlert,
      },
      {
        to: "/admin", // Map logs to admin too
        label: "Logs",
        icon: FileText,
      }
    );
  }

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <aside className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col h-screen sticky top-0 font-sans select-none z-40">
      {/* Sidebar Header Brand */}
      <div className="flex items-center gap-3 p-5 border-b border-slate-200/80">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
          <Train className="w-5.5 h-5.5" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="font-extrabold text-slate-800 text-sm tracking-tight">RailCore Pro</span>
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Enterprise Logistics</span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
        {menuItems.map((item, idx) => {
          const active = isActive(item.to) && (item.label !== "Live Status" && item.label !== "Logs");
          return (
            <Link
              key={idx}
              to={item.to}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                active
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
                  : "text-slate-600 hover:bg-slate-200/50 hover:text-slate-900"
              }`}
            >
              <item.icon className={`w-5 h-5 ${active ? "text-white" : "text-slate-400"}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Status Card & Actions */}
      <div className="p-4 border-t border-slate-200/80 space-y-4">
        {/* System Status Card */}
        <div className="bg-slate-100 border border-slate-200/60 rounded-xl p-4 flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">System Status</span>
          </div>
          <span className="text-xs font-bold text-slate-700">Optimal Performance</span>
        </div>

        {/* Settings & Logout Links */}
        <div className="space-y-1">
          <Link
            to="/contact"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-200/50 hover:text-slate-900 transition-colors"
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Settings</span>
          </Link>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 w-full rounded-xl text-sm font-semibold text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4 text-slate-400 hover:text-red-500" />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
