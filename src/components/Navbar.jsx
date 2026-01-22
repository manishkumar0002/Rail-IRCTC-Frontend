import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Train,
  Home,
  Ticket,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  User,
} from "lucide-react";
import { authAPI, clearAuthStorage } from "../services/api";

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLinks = [
    { to: "/dashboard", label: "Dashboard", icon: Home },
    { to: "/trains", label: "Trains", icon: Train },
    { to: "/my-bookings", label: "My Bookings", icon: Ticket },
    { to: "/payments", label: "Payments", icon: CreditCard },
  ];

  if (isAdmin) {
    navLinks.push({ to: "/admin", label: "Admin Tools", icon: Settings });
  }

  const isActive = (path) => location.pathname === path;

  if (!isAuthenticated) return null;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/dashboard" className="navbar-brand">
          <Train className="navbar-logo-icon" />
          <span className="navbar-logo-text">IRCTC</span>
        </Link>

        {/* Desktop Links */}
        <div className="navbar-links">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`navbar-link ${isActive(link.to) ? "active" : ""}`}
            >
              <link.icon size={18} />
              <span>{link.label}</span>
            </Link>
          ))}
        </div>

        {/* User Section */}
        <div className="navbar-user">
          <div className="user-info">
            <User size={18} />
            <span className="user-name">{user?.name}</span>
            {isAdmin && <span className="admin-badge">Admin</span>}
          </div>

          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>

        {/* Mobile Toggle */}
        <button
          className="mobile-menu-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="mobile-menu animate-slideIn">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`mobile-menu-link ${
                isActive(link.to) ? "active" : ""
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <link.icon size={20} />
              <span>{link.label}</span>
            </Link>
          ))}

          <div className="mobile-user-section">
            <div className="user-info">
              <User size={18} />
              <span>{user?.name}</span>
              {isAdmin && <span className="admin-badge">Admin</span>}
            </div>

            <button onClick={handleLogout} className="logout-btn">
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}

      {/* Styles unchanged */}
      <style>{`
       
      `}</style>
    </nav>
  );
};

export default Navbar;
