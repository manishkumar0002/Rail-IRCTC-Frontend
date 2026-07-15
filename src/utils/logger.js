/**
 * Logger utility to avoid console usage in production builds.
 */
const isDevelopment = import.meta.env?.DEV === true;

const logger = {
  log: (message, data = null) => {
    if (!isDevelopment) return;
    if (data !== null && data !== undefined) {
      console.log(`[LOG] ${message}`, data);
    } else {
      console.log(`[LOG] ${message}`);
    }
  },
  info: (message, data = null) => {
    if (!isDevelopment) return;
    if (data !== null && data !== undefined) {
      console.info(`[INFO] ${message}`, data);
    } else {
      console.info(`[INFO] ${message}`);
    }
  },
  warn: (message, data = null) => {
    if (!isDevelopment) return;
    if (data !== null && data !== undefined) {
      console.warn(`[WARN] ${message}`, data);
    } else {
      console.warn(`[WARN] ${message}`);
    }
  },
  error: (message, error = null) => {
    if (!isDevelopment) return;
    if (error !== null && error !== undefined) {
      console.error(`[ERROR] ${message}`, error);
    } else {
      console.error(`[ERROR] ${message}`);
    }
  },
  debug: (message, data = null) => {
    if (!isDevelopment) return;
    if (data !== null && data !== undefined) {
      console.debug(`[DEBUG] ${message}`, data);
    } else {
      console.debug(`[DEBUG] ${message}`);
    }
  },
};

export default logger;
