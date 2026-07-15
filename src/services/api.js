import axios from "axios";
import { API_BASE_URL } from "../config/api";
import logger from "../utils/logger";

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
    logger.debug("API Request", { method, url: config.url });

    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    logger.error("Request Error", error.message);
    return Promise.reject(error);
  },
);

// ==============================
// Response Interceptor
// ==============================
api.interceptors.response.use(
  (response) => {
    logger.debug("API Response", {
      status: response.status,
      url: response.config.url,
    });
    return response;
  },
  (error) => {
    logger.error("API Error", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    // ✅ FORCE LOGOUT ON JWT EXPIRY (401 Unauthorized)
    if (error.response?.status === 401) {
      logger.warn("JWT expired or invalid - forcing logout");

      // Clear all auth data
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.clear();

      // Redirect to login (only if not already there)
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

export default api;

// ==============================
// Auth APIs
// ==============================
export const authAPI = {
  login: (email, password) => api.post("/api/auth/login", { email, password }),

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
  createBooking: (bookingData) => api.post("/api/bookings", bookingData),

  getMyBookings: () => api.get("/api/bookings/my-bookings"),

  cancelBooking: (bookingId) =>
    api.delete(`/api/bookings/cancellations/${bookingId}`),
};

// ==============================
// Passenger APIs
// ==============================
export const passengerAPI = {
  getPassengers: (bookingId) => api.get(`/api/passengers/${bookingId}`),

  addPassengers: (bookingId, passengers) =>
    api.post(`/api/passengers/${bookingId}`, passengers),
};

// ==============================
// Payment APIs
// ==============================
export const paymentAPI = {
  createPaymentOrder: (bookingId) =>
    api.post(`/api/payments/create-order/${bookingId}`),

  verifyPayment: (paymentData) => api.post(`/api/payments/verify`, paymentData),

  makePayment: (bookingId, success, paymentMethod) =>
    api.post(`/api/payments/${bookingId}`, null, {
      params: { success, paymentMethod },
    }),

  getPaymentStatus: (bookingId) => api.get(`/api/payments/status/${bookingId}`),
};

// ==============================
// Admin APIs
// ==============================
export const adminAPI = {
  getTrains: () => api.get("/api/admin/trains"),
  addTrain: (trainData) => api.post("/api/admin/trains", trainData),

  getStations: () => api.get("/api/admin/stations"),
  addStation: (stationData) => api.post("/api/admin/stations", stationData),

  getRoute: (trainId) => api.get(`/api/admin/routes/${trainId}`),

  addStop: (trainId, stationCode, stopOrder, halt) =>
    api.post(`/api/admin/routes/${trainId}/stops`, null, {
      params: { stationCode, stopOrder, halt },
    }),

  deleteStop: (stopId) => api.delete(`/api/admin/routes/stops/${stopId}`),

  initializeSeats: (trainId, travelDate, classType, seats) =>
    api.post("/api/admin/seats/init", null, {
      params: { trainId, travelDate, classType, seats },
    }),

  getAllBookings: () => api.get("/api/admin/bookings"),

  getAllPayments: () => api.get("/api/admin/payments"),

  // Coach Management
  getCoaches: (trainId) => api.get("/api/admin/v1/coaches", { params: { trainId } }),
  createCoach: (coachData) => api.post("/api/admin/v1/coaches", coachData),
  deleteCoach: (coachId) => api.delete(`/api/admin/v1/coaches/${coachId}`),

  // Charts
  prepareChart: (trainId, travelDate) => api.post("/api/admin/v1/charts/prepare", null, { params: { trainId, travelDate } }),

  // Analytics
  getAnalyticsDashboard: () => api.get("/api/admin/v1/analytics/dashboard"),

  // Actuator health
  getActuatorHealth: () => api.get("/actuator/health"),
};

// ==============================
// Public & User APIs
// ==============================
export const pnrAPI = {
  getPnrStatus: (pnr) => api.get(`/api/public/v1/pnr/${pnr}`),
};

export const scheduleAPI = {
  getTrainSchedule: (trainId) => api.get(`/api/public/v1/trains/${trainId}/schedule`),
  updateStopDetails: (stopId, details) => api.put(`/api/admin/v1/schedules/stops/${stopId}`, null, { params: details }),
};

export const chartAPI = {
  getChartStatus: (trainId, travelDate) => api.get("/api/public/v1/charts/status", { params: { trainId, travelDate } }),
};

export const timelineAPI = {
  getTimeline: (bookingId) => api.get(`/api/v1/timeline/${bookingId}`),
};

export const savedPassengerAPI = {
  getSavedPassengers: () => api.get("/api/v1/passengers/saved"),
  savePassenger: (passengerData) => api.post("/api/v1/passengers/saved", passengerData),
  updatePassenger: (id, passengerData) => api.put(`/api/v1/passengers/saved/${id}`, passengerData),
  deletePassenger: (id) => api.delete(`/api/v1/passengers/saved/${id}`),
};

export const dashboardAPI = {
  getSummary: () => api.get("/api/v1/dashboard/summary"),
};

export const trackingAPI = {
  getLiveLocation: (trainId) => api.get(`/api/public/v1/tracking/${trainId}/live`),
};

export const fareAPI = {
  getFareBreakdown: (bookingId) => api.get(`/api/v1/fare/breakdown/${bookingId}`),
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

  logger.debug("Clearing auth storage");

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
