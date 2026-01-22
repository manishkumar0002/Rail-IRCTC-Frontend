import {
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastViewport,
  ToastProvider,
} from "./Toast";

export default function ToastContainer({ toasts, removeToast }) {
  return (
    <ToastProvider swipeDirection="right">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          variant={toast.variant || "default"}
          duration={4000}
          onOpenChange={(open) => {
            if (!open) removeToast(toast.id);
          }}
        >
          <div className="grid gap-1">
            <ToastTitle>
              {(toast.variant || "info").toUpperCase()}
            </ToastTitle>
            <ToastDescription>{toast.message}</ToastDescription>
          </div>
          <ToastClose />
        </Toast>
      ))}

      <ToastViewport />
    </ToastProvider>
  );
}
