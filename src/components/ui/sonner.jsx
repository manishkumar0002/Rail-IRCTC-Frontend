import { Toaster as Sonner, toast } from "sonner";

/**
 * Simple React-compatible Toaster
 * Theme can be "light" | "dark" | "system"
 */
const Toaster = (props) => {
 const theme = document.documentElement.classList.contains("dark")
  ? "dark"
  : "light";
 // change to "light" or "dark" if needed

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
