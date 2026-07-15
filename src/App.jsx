import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";

import Index from "./pages/Index";
import Login from "./pages/Login";
import LoginSuccess from "./pages/LoginSuccess";
import OAuthSuccess from "./pages/OAuthSuccess";
import Dashboard from "./pages/Dashboard";
import Trains from "./pages/Trains";
import MyBookings from "./pages/MyBookings";
import Payments from "./pages/Payments";
import AdminTools from "./pages/AdminTools";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div>Authenticating...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

const MainLayout = ({ children }) => (
  <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
    <Sidebar />
    <div className="flex-1 flex flex-col min-w-0">
      <Navbar />
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">{children}</main>
      <Footer />
    </div>
  </div>
);

export default function App() {
  return (
    <Routes>
      {/* Public Home Page */}
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="/home" element={<Index />} />
      <Route path="/contact" element={<Contact />} />

      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      <Route path="/login-success" element={<LoginSuccess />} />
      <Route path="/oauth-success" element={<OAuthSuccess />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/trains"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Trains />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-bookings"
        element={
          <ProtectedRoute>
            <MainLayout>
              <MyBookings />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/payment"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Payments />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/payments"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Payments />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <MainLayout>
              <AdminTools />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}