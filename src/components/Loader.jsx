import React from "react";
import { Train } from "lucide-react";

const Loader = ({ text = "Loading...", fullScreen = false }) => {
  return (
    <div className={`loader-container ${fullScreen ? "full-screen" : ""}`}>
      <div className="loader-content">
        <div className="train-loader">
          <Train className="train-icon" />
        </div>

        <div className="loader-track">
          <div className="track-line"></div>
          <div className="track-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>

        <p className="loader-text">{text}</p>
      </div>

      <style>{`
        .loader-container {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3rem;
        }

        .loader-container.full-screen {
          position: fixed;
          inset: 0;
          background: hsl(var(--background));
          z-index: 9999;
        }

        .loader-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
        }

        .train-loader {
          position: relative;
        }

        .train-icon {
          width: 60px;
          height: 60px;
          color: hsl(var(--primary));
          animation: trainMove 1.5s ease-in-out infinite;
        }

        .loader-track {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .track-line {
          width: 150px;
          height: 4px;
          background: hsl(var(--muted));
          border-radius: 2px;
          position: relative;
          overflow: hidden;
        }

        .track-line::after {
          content: "";
          position: absolute;
          top: 0;
          left: -50%;
          width: 50%;
          height: 100%;
          background: var(--gradient-primary);
          animation: trackMove 1s ease-in-out infinite;
        }

        @keyframes trackMove {
          from {
            left: -50%;
          }
          to {
            left: 100%;
          }
        }

        .track-dots {
          display: flex;
          gap: 0.5rem;
        }

        .track-dots span {
          width: 8px;
          height: 8px;
          background: hsl(var(--muted));
          border-radius: 50%;
          animation: dotPulse 1.5s ease-in-out infinite;
        }

        .track-dots span:nth-child(2) {
          animation-delay: 0.2s;
        }

        .track-dots span:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes dotPulse {
          0%, 100% {
            background: hsl(var(--muted));
            transform: scale(1);
          }
          50% {
            background: hsl(var(--primary));
            transform: scale(1.2);
          }
        }

        .loader-text {
          color: hsl(var(--muted-foreground));
          font-weight: 500;
          animation: pulse 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Loader;
