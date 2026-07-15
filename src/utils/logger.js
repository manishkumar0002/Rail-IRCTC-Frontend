/**
 * Logger utility to avoid console usage in production builds.
 * Disabled general logs/debugs for security, preserving error logging to stderr.
 */
const isDevelopment = import.meta.env?.DEV === true;

const logger = {
  log: (message, data = null) => {
    // Disabled for security - do not print general logs to browser console
  },
  info: (message, data = null) => {
    // Disabled for security - do not print info logs to browser console
  },
  warn: (message, data = null) => {
    // Warnings are written to console.warn (collected in error streams)
    if (data !== null && data !== undefined) {
      console.warn(`[WARN] ${message}`, data);
    } else {
      console.warn(`[WARN] ${message}`);
    }
  },
  error: (message, error = null) => {
    // Errors are written to console.error (which writes to stderr and is captured by logging dashboards)
    if (error !== null && error !== undefined) {
      console.error(`[ERROR] ${message}`, error);
    } else {
      console.error(`[ERROR] ${message}`);
    }
  },
  debug: (message, data = null) => {
    // Disabled for security - do not leak debugging trace details
  },
};

export default logger;
