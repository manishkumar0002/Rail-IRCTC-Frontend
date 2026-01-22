import { useCallback, useState } from "react";

export default function useToast() {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, variant = "info") => {
    setToasts((prev) => [
      ...prev,
      { id: crypto.randomUUID(), message, variant },
    ]);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return {
    toasts,
    showToast,
    removeToast,
    success: (msg) => showToast(msg, "success"),
    error: (msg) => showToast(msg, "error"),
    info: (msg) => showToast(msg, "info"),
  };
}
