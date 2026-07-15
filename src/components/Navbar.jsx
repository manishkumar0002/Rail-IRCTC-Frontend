import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Train,
  Bell,
  Settings,
  Search,
  Plus,
  LogOut,
  ShieldCheck
} from "lucide-react";
import logger from "../utils/logger";

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [pnrSearch, setPnrSearch] = useState("");

  const handleLogout = () => {
    logger.debug("Navbar: Triggering logout");
    logout();
    navigate("/login");
  };

  const handlePnrSearchSubmit = (e) => {
    e.preventDefault();
    if (!pnrSearch.trim()) return;
    logger.debug("Navbar PNR search query:", pnrSearch);
    navigate("/my-bookings", { state: { searchPnr: pnrSearch } });
    setPnrSearch("");
  };

  const isActive = (path) => location.pathname === path;

  if (!isAuthenticated) return null;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-3 font-sans w-full">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">
        
        {/* LEFT: Branding & Main Navigation Tabs */}
        <div className="flex items-center gap-8">
          <Link to="/dashboard" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Train className="w-4.5 h-4.5" />
            </div>
            <span className="text-base font-black tracking-tight text-blue-700">
              RailCore <span className="text-slate-800 font-extrabold">Enterprise</span>
            </span>
          </Link>

          {/* Nav Tabs containing all dashboard routes */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/dashboard"
              className={`px-3 py-1.5 text-xs font-bold transition-all relative ${
                isActive("/dashboard")
                  ? "text-blue-700 border-b-2 border-blue-700"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Executive Dashboard
            </Link>
            <Link
              to="/trains"
              className={`px-3 py-1.5 text-xs font-bold transition-all relative ${
                isActive("/trains")
                  ? "text-blue-700 border-b-2 border-blue-700"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Train Search
            </Link>
            <Link
              to="/my-bookings"
              className={`px-3 py-1.5 text-xs font-bold transition-all relative ${
                isActive("/my-bookings")
                  ? "text-blue-700 border-b-2 border-blue-700"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Booking History
            </Link>
            <Link
              to="/payments"
              className={`px-3 py-1.5 text-xs font-bold transition-all relative ${
                isActive("/payments")
                  ? "text-blue-700 border-b-2 border-blue-700"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Payments
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className={`px-3 py-1.5 text-xs font-bold transition-all relative ${
                  isActive("/admin")
                    ? "text-blue-700 border-b-2 border-blue-700"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Admin Panel
              </Link>
            )}
          </div>
        </div>

        {/* RIGHT: Search, Utilities, New Booking, Profile & Log Out */}
        <div className="flex items-center gap-4 ml-auto">
          {/* Search bar */}
          <form onSubmit={handlePnrSearchSubmit} className="relative hidden lg:flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search PNR..."
              value={pnrSearch}
              onChange={(e) => setPnrSearch(e.target.value)}
              className="pl-9 pr-12 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all w-52"
            />
            <span className="absolute right-2.5 text-[9px] font-bold text-slate-400 bg-slate-200/50 px-1 rounded pointer-events-none">
              ⌘K
            </span>
          </form>

          {/* Action Icons */}
          <div className="flex items-center gap-3 text-slate-500 pl-2">
            <button className="hover:text-slate-800 transition-colors relative p-1.5 rounded-lg hover:bg-slate-100" title="Notifications">
              <Bell className="w-4.5 h-4.5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full border border-white"></span>
            </button>
            
            <button
              onClick={() => navigate("/admin")}
              className="hover:text-slate-800 transition-colors p-1.5 rounded-lg hover:bg-slate-100"
              title="Admin Tools"
            >
              <Settings className="w-4.5 h-4.5" />
            </button>

            <button
              onClick={handleLogout}
              className="hover:text-red-600 text-slate-400 transition-colors p-1.5 rounded-lg hover:bg-red-50"
              title="Log Out"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* User Profile Avatar */}
          <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 text-blue-700 flex items-center justify-center font-bold text-xs shadow-sm cursor-pointer select-none">
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="hidden sm:block text-left leading-none">
              <p className="text-[10px] font-bold text-slate-800">{user?.name || "Traveler"}</p>
              <span className="text-[8px] text-slate-400 font-semibold uppercase">{isAdmin ? "Admin" : "User"}</span>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
};

export default Navbar;
