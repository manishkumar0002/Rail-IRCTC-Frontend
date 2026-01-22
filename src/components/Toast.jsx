import * as React from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { cva } from "class-variance-authority";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const ToastProvider = ToastPrimitives.Provider;

export const ToastViewport = React.forwardRef(
  ({ className, ...props }, ref) => (
    <ToastPrimitives.Viewport
      ref={ref}
      className={cn(
        "fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col gap-2 p-4 sm:max-w-[420px]",
        className
      )}
      {...props}
    />
  )
);
ToastViewport.displayName = "ToastViewport";

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 pr-8 shadow-lg transition-all",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        success: "bg-green-600 text-white",
        error: "bg-red-600 text-white",
        info: "bg-blue-600 text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export const Toast = React.forwardRef(
  ({ className, variant, ...props }, ref) => (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  )
);
Toast.displayName = "Toast";

export const ToastTitle = React.forwardRef((props, ref) => (
  <ToastPrimitives.Title ref={ref} className="text-sm font-semibold" {...props} />
));

export const ToastDescription = React.forwardRef((props, ref) => (
  <ToastPrimitives.Description ref={ref} className="text-sm opacity-90" {...props} />
));

export const ToastClose = React.forwardRef((props, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className="absolute right-2 top-2 rounded-md p-1 opacity-70 hover:opacity-100"
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
));
