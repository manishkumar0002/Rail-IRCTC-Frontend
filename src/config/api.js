// Centralized API base URL
// Uses Vercel/Env value; falls back to local dev port only when env missing
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
