import React from "react";
import { Train, MapPin, Users } from "lucide-react";

const TrainCard = ({
  train,
  source,
  destination,
  onSelect,
  availableSeats,
}) => {
  return (
    <div className="train-card" onClick={() => onSelect && onSelect(train)}>
      <div className="train-card-header">
        <div className="train-icon-wrapper">
          <Train className="train-icon" />
        </div>
        <div className="train-info">
          <span className="train-number">{train.trainNumber}</span>
          <h3 className="train-name">{train.trainName}</h3>
        </div>
      </div>

      {source && destination && (
        <div className="train-route">
          <div className="route-point">
            <MapPin size={16} className="route-icon" />
            <span>{source}</span>
          </div>

          <div className="route-line">
            <div className="route-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <Train size={16} className="moving-train" />
          </div>

          <div className="route-point">
            <MapPin size={16} className="route-icon" />
            <span>{destination}</span>
          </div>
        </div>
      )}

      <div className="train-card-footer">
        <div className="seat-info">
          <Users size={16} />
          <span>Total Seats: {train.totalSeats}</span>
        </div>

        {availableSeats !== undefined && (
          <div
            className={`available-seats ${
              availableSeats > 0 ? "available" : "sold-out"
            }`}
          >
            {availableSeats > 0
              ? `${availableSeats} Available`
              : "Sold Out"}
          </div>
        )}

        {onSelect && (
          <button className="select-btn">
            Book Now
          </button>
        )}
      </div>

      <style>{`
        .train-card {
          background: hsl(var(--card));
          border: 1px solid hsl(var(--border));
          border-radius: var(--radius);
          padding: 1.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .train-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: var(--gradient-primary);
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }

        .train-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
        }

        .train-card:hover::before {
          transform: scaleX(1);
        }

        .train-card-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.25rem;
        }

        .train-icon-wrapper {
          width: 50px;
          height: 50px;
          background: var(--gradient-primary);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .train-icon {
          color: white;
          width: 28px;
          height: 28px;
        }

        .train-number {
          font-size: 0.85rem;
          color: hsl(var(--primary));
          font-weight: 600;
        }

        .train-name {
          font-size: 1.1rem;
          font-weight: 600;
          color: hsl(var(--foreground));
          margin-top: 0.25rem;
        }

        .train-route {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem;
          background: hsl(var(--muted));
          border-radius: var(--radius);
          margin-bottom: 1rem;
        }

        .route-point {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 500;
        }

        .route-icon {
          color: hsl(var(--primary));
        }

        .route-line {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .route-dots {
          display: flex;
          gap: 0.5rem;
          position: absolute;
        }

        .route-dots span {
          width: 6px;
          height: 6px;
          background: hsl(var(--border));
          border-radius: 50%;
        }

        .moving-train {
          color: hsl(var(--primary));
          animation: trainMove 2s ease-in-out infinite;
        }

        .train-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .seat-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          color: hsl(var(--muted-foreground));
        }

        .available-seats {
          padding: 0.375rem 0.875rem;
          border-radius: 9999px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .available-seats.available {
          background: hsla(var(--success), 0.15);
          color: hsl(var(--success));
        }

        .available-seats.sold-out {
          background: hsla(var(--destructive), 0.15);
          color: hsl(var(--destructive));
        }

        .select-btn {
          padding: 0.5rem 1.25rem;
          background: var(--gradient-primary);
          color: white;
          border: none;
          border-radius: var(--radius);
          cursor: pointer;
          font-weight: 500;
        }

        .select-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px hsla(var(--primary), 0.3);
        }
      `}</style>
    </div>
  );
};

export default TrainCard;
