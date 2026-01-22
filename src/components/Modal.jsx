import { useEffect } from "react";
import { X } from "lucide-react";

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
}) => {
  // Disable body scroll when modal open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Close modal on ESC key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "400px",
    md: "500px",
    lg: "700px",
    xl: "900px",
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container animate-scaleIn"
        style={{ maxWidth: sizeClasses[size] }}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="modal-header">
            <h2 className="modal-title">{title}</h2>
            <button className="modal-close" onClick={onClose}>
              <X size={24} />
            </button>
          </div>
        )}

        <div className="modal-body">{children}</div>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
          animation: fadeIn 0.2s ease-out;
        }

        .modal-container {
          background: hsl(var(--card));
          border-radius: var(--radius);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          width: 100%;
          max-height: 90vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid hsl(var(--border));
        }

        .modal-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: hsl(var(--foreground));
        }

        .modal-close {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          background: transparent;
          border: none;
          border-radius: var(--radius);
          color: hsl(var(--muted-foreground));
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .modal-close:hover {
          background: hsl(var(--muted));
          color: hsl(var(--foreground));
        }

        .modal-body {
          padding: 1.5rem;
          overflow-y: auto;
        }
      `}</style>
    </div>
  );
};

export default Modal;
