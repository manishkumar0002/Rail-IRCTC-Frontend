import { createContext, useContext, useEffect, useState } from "react";
import { authAPI, clearAuthStorage } from "../services/api";

const AuthContext = createContext(null);

/* ================================
   🔐 JWT Decode Helper
================================ */
const decodeToken = (token) => {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (err) {
    console.error("❌ Failed to decode token:", err);
    return null;
  }
};

/* ================================
   🔐 Auth Provider
================================ */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  /* ================================
     🔄 Restore Session
  ================================ */
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        console.log("✅ Session restored from localStorage");
      } catch (err) {
        console.error("❌ Session restore failed:", err);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  /* ================================
     🔐 Normal Login
  ================================ */
  const login = async (email, password) => {
    try {
      console.log("🔐 Attempting login:", email);

      const res = await authAPI.login(email, password);

      if (!res.data?.token) {
        throw new Error("Token missing in response");
      }

      const decoded = decodeToken(res.data.token);
      console.log("🔍 Decoded JWT:", decoded);

      const userData = {
        email: decoded.sub,
        name: decoded.sub.split("@")[0],
        role: decoded.role, // ✅ REAL ROLE FROM JWT
      };

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(userData));

      setToken(res.data.token);
      setUser(userData);

      console.log("✅ Login successful:", userData);
      return userData;
    } catch (err) {
      console.error("❌ Login failed:", err.response?.data || err.message);
      throw err;
    }
  };

  /* ================================
     📝 Register
  ================================ */
  const register = async (name, email, password) => {
    try {
      const res = await authAPI.register(name, email, password);
      console.log("✅ Registration successful");
      return res.data;
    } catch (err) {
      console.error("❌ Registration failed:", err.response?.data || err.message);
      throw err;
    }
  };

  /* ================================
     🔑 Google OAuth Token Login
  ================================ */
  const loginWithToken = async (jwt) => {
    try {
      console.log("🔑 Logging in with OAuth token");

      const decoded = decodeToken(jwt);
      console.log("🔍 Decoded OAuth JWT:", decoded);

      const userData = {
        email: decoded.sub,
        name: decoded.sub.split("@")[0],
        role: decoded.role,
      };

      localStorage.setItem("token", jwt);
      localStorage.setItem("user", JSON.stringify(userData));

      setToken(jwt);
      setUser(userData);

      console.log("✅ OAuth login successful:", userData);
    } catch (err) {
      console.error("❌ OAuth login failed:", err);
      logout();
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /* ================================
     🚪 Logout
  ================================ */
  const logout = () => {
    console.log("🚪 Logging out...");
    
    // Clear all authentication data
    clearAuthStorage();
    
    // Clear React state
    setUser(null);
    setToken(null);
    
    // Clear all localStorage
    localStorage.clear();
    
    // Clear all sessionStorage
    sessionStorage.clear();
    
    // Clear IndexedDB if exists
    if (window.indexedDB) {
      window.indexedDB.databases().then((databases) => {
        databases.forEach((db) => {
          window.indexedDB.deleteDatabase(db.name);
        });
      }).catch((err) => console.warn("IndexedDB clear failed:", err));
    }
    
    // Clear service worker cache
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach((name) => {
          caches.delete(name);
        });
      }).catch((err) => console.warn("Cache clear failed:", err));
    }
    
    // Unregister service workers
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          registration.unregister();
        });
      }).catch((err) => console.warn("Service worker unregister failed:", err));
    }
    
    console.log("✅ Logged out and cleared all cache/session data");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: Boolean(user && token),
        isAdmin: user?.role === "ADMIN", // ✅ FIXED
        login,
        register,
        loginWithToken,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/* ================================
   🔁 Hook
================================ */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
};
