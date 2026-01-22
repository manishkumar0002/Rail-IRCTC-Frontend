import React from "react";
import {
  Train,
  Calendar,
  MapPin,
  Users,
  Hash,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";

const BookingCard = ({ booking, onCancel, onViewDetails }) => {
  const getStatusIcon = () => {
    switch (booking.status?.toLowerCase()) {
      case "confirmed":
        return <CheckCircle size={16} />;
      case "cancelled":
        return <XCircle size={16} />;
      default:
        return <AlertCircle size={16} />;
    }
  };

  const getStatusClass = () => {
    switch (booking.status?.toLowerCase()) {
      case "confirmed":
        return "status-confirmed";
      case "cancelled":
        return "status-cancelled";
      default:
        return "status-pending";
    }
  };

  return (
    <div className="booking-card">
      <div className="booking-header">
        <div className="pnr-section">
          <Hash size={16} />
          <span className="pnr-label">PNR:</span>
          <span className="pnr-value">{booking.pnr}</span>
        </div>

        <div className={`booking-status ${getStatusClass()}`}>
          {getStatusIcon()}
          <span>{booking.status}</span>
        </div>
      </div>

      <div className="booking-body">
        <div className="train-details">
          <div className="train-icon-box">
            <Train size={24} />
          </div>
          <div className="train-text">
            <span className="train-number">{booking.trainNumber}</span>
            <span className="train-name">{booking.trainName}</span>
          </div>
        </div>

        <div className="journey-details">
          <div className="journey-route">
            <div className="station from">
              <MapPin size={16} />
              <span>{booking.sourceStationCode}</span>
            </div>
            <div className="route-arrow">→</div>
            <div className="station to">
              <MapPin size={16} />
              <span>{booking.destinationStationCode}</span>
            </div>
          </div>

          <div className="journey-meta">
            <div className="meta-item">
              <Calendar size={16} />
              <span>
                {new Date(booking.travelDate).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="meta-item">
              <Users size={16} />
              <span>{booking.seatCount} Passenger(s)</span>
            </div>
            <div className="class-badge">{booking.classType}</div>
          </div>
        </div>
      </div>

      <div className="booking-footer">
        {onViewDetails && (
          <button className="btn-view" onClick={() => onViewDetails(booking)}>
            View Details
          </button>
        )}

        {onCancel && booking.status?.toLowerCase() !== "cancelled" && (
          <button
            className="btn-cancel"
            onClick={() => onCancel(booking.id)}
          >
            Cancel Booking
          </button>
        )}
      </div>

      <style>{`
        .booking-card {
          background: hsl(var(--card));
          border: 1px solid hsl(var(--border));
          border-radius: var(--radius);
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .booking-card:hover {
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }

        .booking-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.25rem;
          background: hsl(var(--muted));
          border-bottom: 1px solid hsl(var(--border));
        }

        .pnr-section {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .pnr-label {
          font-weight: 500;
          color: hsl(var(--muted-foreground));
        }

        .pnr-value {
          font-weight: 700;
          font-family: monospace;
          font-size: 1.1rem;
          color: hsl(var(--primary));
        }

        .booking-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.375rem 0.875rem;
          border-radius: 9999px;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .status-confirmed {
          background: hsla(var(--success), 0.15);
          color: hsl(var(--success));
        }

        .status-cancelled {
          background: hsla(var(--destructive), 0.15);
          color: hsl(var(--destructive));
        }

        .status-pending {
          background: hsla(var(--warning), 0.15);
          color: hsl(var(--warning));
        }

        .booking-body {
          padding: 1.25rem;
        }

        .train-details {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.25rem;
        }

        .train-icon-box {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--gradient-primary);
          border-radius: 10px;
          color: white;
        }

        .train-number {
          font-size: 0.85rem;
          color: hsl(var(--primary));
          font-weight: 600;
        }

        .train-name {
          font-size: 1.1rem;
          font-weight: 600;
        }

        .journey-details {
          background: hsl(var(--muted));
          padding: 1rem;
          border-radius: var(--radius);
        }

        .journey-route {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .station {
          display: flex;
          gap: 0.5rem;
          font-weight: 600;
        }

        .route-arrow {
          font-size: 1.5rem;
          font-weight: bold;
          color: hsl(var(--primary));
        }

        .journey-meta {
          display: flex;
          justify-content: center;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .class-badge {
          padding: 0.25rem 0.75rem;
          background: var(--gradient-secondary);
          color: white;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .booking-footer {
          display: flex;
          gap: 0.75rem;
          padding: 1rem 1.25rem;
          border-top: 1px solid hsl(var(--border));
        }

        .btn-view {
          flex: 1;
          background: var(--gradient-primary);
          color: white;
          border: none;
          border-radius: var(--radius);
          padding: 0.625rem 1rem;
          cursor: pointer;
        }

        .btn-cancel {
          background: transparent;
          color: hsl(var(--destructive));
          border: 1px solid hsl(var(--destructive));
          border-radius: var(--radius);
          padding: 0.625rem 1rem;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default BookingCard;
