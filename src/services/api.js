import axios from "axios";

const API_BASE_URL = "http://localhost:8080";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ==============================
// Request Interceptor
// ==============================
api.interceptors.request.use(
  (config) => {
    console.log("📤 API Request:", config.method.toUpperCase(), config.url);
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
    console.log("📥 API Response:", response.status, response.data);
    return response;
  },
  (error) => {
    console.error("❌ API Error:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    
    if (error.response?.status === 401) {
      clearAuthStorage();
      window.location.href = "/login";
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

  // CHOOSE ONE OF THESE THREE OPTIONS:
  // Option 1: If your backend has /api/auth/me
  getProfile: () => api.get("/api/auth/me"),
  
  // Option 2: If your backend has /api/auth/profile
  // getProfile: () => api.get("/api/auth/profile"),
  
  // Option 3: If your backend has /api/user or /api/users/me
  // getProfile: () => api.get("/api/user"),
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
  
  // Public endpoint for stations (fallback if admin endpoint fails)
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
  // Create payment order (initiates payment)
  createPaymentOrder: (bookingId) =>
    api.post(`/api/payments/create-order`, { bookingId }),
  
  // Verify payment after gateway callback
  verifyPayment: (paymentData) =>
    api.post(`/api/payments/verify`, paymentData),
  
  // Old method (kept for backward compatibility)
  makePayment: (bookingId, success, paymentMethod) =>
    api.post(`/api/payments/${bookingId}`, null, {
      params: { success, paymentMethod },
    }),
  
  // Get payment status
  getPaymentStatus: (bookingId) =>
    api.get(`/api/payments/status/${bookingId}`),
};

// ==============================
// Admin APIs
// ==============================
export const adminAPI = {
  // Trains
  getTrains: () => api.get("/api/admin/trains"),

  addTrain: (trainData) =>
    api.post("/api/admin/trains", trainData),

  // Stations
  getStations: () => api.get("/api/admin/stations"),

  addStation: (stationData) =>
    api.post("/api/admin/stations", stationData),

  // Routes
  getRoute: (trainId) =>
    api.get(`/api/admin/routes/${trainId}`),

  addStop: (trainId, stationCode, stopOrder, halt) =>
    api.post(`/api/admin/routes/${trainId}/stops`, null, {
      params: { stationCode, stopOrder, halt },
    }),

  deleteStop: (stopId) =>
    api.delete(`/api/admin/routes/stops/${stopId}`),

  // Seats
  initializeSeats: (trainId, travelDate, classType, seats) =>
    api.post("/api/admin/seats/init", null, {
      params: { trainId, travelDate, classType, seats },
    }),

  // Bookings & Payments
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

export const clearAuthStorage = () => {
  if (typeof window === "undefined") return;
  
  console.log("🧹 Clearing all auth storage...");
  
  // Clear specific auth items
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  
  // Clear all sessionStorage
  sessionStorage.clear();
  
  // Clear all cookies
  document.cookie.split(";").forEach((cookie) => {
    const name = cookie.split("=")[0].trim();
    // Clear for current path
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    // Clear for domain
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
    // Clear for root domain
    const rootDomain = window.location.hostname.split('.').slice(-2).join('.');
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${rootDomain};`;
  });
  
  // Clear browser cache (request browser to reload without cache)
  if ('caches' in window) {
    caches.keys().then((names) => {
      names.forEach((name) => {
        caches.delete(name);
      });
    });
  }
  
  console.log("✅ Auth storage cleared");
};