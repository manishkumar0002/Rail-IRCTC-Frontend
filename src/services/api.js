import axios from "axios";
import { API_BASE_URL } from "../config/api";

// ==============================
// Base URL check (IMPORTANT)
// ==============================
if (!API_BASE_URL) {
  console.error(" VITE_API_BASE_URL is NOT defined");
} else {
  console.log("🔗 API_BASE_URL =", API_BASE_URL);
}

// ==============================
// Axios instance
// ==============================
const api = axios.create({
  baseURL: API_BASE_URL, // ✅ NO localhost
  headers: {
    "Content-Type": "application/json",
  },
});

// ==============================
// Request Interceptor
// ==============================
api.interceptors.request.use(
  (config) => {
    const method = config.method?.toUpperCase() || "REQUEST";
    console.log("📤 API Request:", method, config.url);

    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error.message);
    return Promise.reject(error);
  }
);

// ==============================
// Response Interceptor
// ==============================
api.interceptors.response.use(
  (response) => {
    console.log("📥 API Response:", response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error("❌ API Error:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    // Auto logout on 401 (token expired / invalid)
    if (error.response?.status === 401) {
      clearAuthStorage();
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// ==============================
// Auth APIs
// ==============================
export const authAPI = {
  login: (email, password) =>
    api.post("/api/auth/login", { email, password }),

  register: (name, email, password) =>
    api.post("/api/auth/register", { name, email, password }),

  getProfile: () => api.get("/api/auth/me"),
};

// ==============================
// Train APIs
// ==============================
export const trainAPI = {
  getAllTrains: () => api.get("/api/trains"),

  searchTrains: (source, destination) =>
    api.get("/api/trains/search", {
      params: { source, destination },
    }),

  getSeatAvailability: (trainId, travelDate, classType) =>
    api.get("/api/seat-availability", {
      params: { trainId, travelDate, classType },
    }),

  getStations: () => api.get("/api/stations"),
};

// ==============================
// Booking APIs
// ==============================
export const bookingAPI = {
  createBooking: (bookingData) =>
    api.post("/api/bookings", bookingData),

  getMyBookings: () =>
    api.get("/api/bookings/my-bookings"),

  cancelBooking: (bookingId) =>
    api.delete(`/api/bookings/cancellations/${bookingId}`),
};

// ==============================
// Passenger APIs
// ==============================
export const passengerAPI = {
  getPassengers: (bookingId) =>
    api.get(`/api/passengers/${bookingId}`),

  addPassengers: (bookingId, passengers) =>
    api.post(`/api/passengers/${bookingId}`, passengers),
};

// ==============================
// Payment APIs
// ==============================
export const paymentAPI = {
  createPaymentOrder: (bookingId) =>
    api.post(`/api/payments/create-order/${bookingId}`),

  verifyPayment: (paymentData) =>
    api.post(`/api/payments/verify`, paymentData),

  makePayment: (bookingId, success, paymentMethod) =>
    api.post(`/api/payments/${bookingId}`, null, {
      params: { success, paymentMethod },
    }),

  getPaymentStatus: (bookingId) =>
    api.get(`/api/payments/status/${bookingId}`),
};

// ==============================
// Admin APIs
// ==============================
export const adminAPI = {
  getTrains: () => api.get("/api/admin/trains"),
  addTrain: (trainData) =>
    api.post("/api/admin/trains", trainData),

  getStations: () => api.get("/api/admin/stations"),
  addStation: (stationData) =>
    api.post("/api/admin/stations", stationData),

  getRoute: (trainId) =>
    api.get(`/api/admin/routes/${trainId}`),

  addStop: (trainId, stationCode, stopOrder, halt) =>
    api.post(`/api/admin/routes/${trainId}/stops`, null, {
      params: { stationCode, stopOrder, halt },
    }),

  deleteStop: (stopId) =>
    api.delete(`/api/admin/routes/stops/${stopId}`),

  initializeSeats: (trainId, travelDate, classType, seats) =>
    api.post("/api/admin/seats/init", null, {
      params: { trainId, travelDate, classType, seats },
    }),

  getAllBookings: () =>
    api.get("/api/admin/bookings"),

  getAllPayments: () =>
    api.get("/api/admin/payments"),
};

// ==============================
// Health API
// ==============================
export const healthAPI = {
  check: () => api.get("/api/health"),
};

// ==============================
// Clear Auth Storage
// ==============================
export const clearAuthStorage = () => {
  if (typeof window === "undefined") return;

  console.log("🧹 Clearing auth storage");

  localStorage.removeItem("token");
  localStorage.removeItem("user");
  sessionStorage.clear();

  document.cookie.split(";").forEach((cookie) => {
    const name = cookie.split("=")[0].trim();
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  });

  if ("caches" in window) {
    caches.keys().then((names) => {
      names.forEach((name) => caches.delete(name));
    });
  }
};
