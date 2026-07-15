import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { trainAPI, adminAPI, bookingAPI } from "../services/api";
import {
  Train,
  Search,
  MapPin,
  Calendar,
  Users,
  ChevronRight,
} from "lucide-react";
import Loader from "../components/Loader";
import TrainCard from "../components/TrainCard";
import Modal from "../components/Modal";
import ToastContainer from "../components/ToastContainer";
import useToast from "../hooks/useToast";
import authBgImage from "../assets/authafterimg.jpg";
import logger from "../utils/logger";

const classTypes = [
  { value: "SL", label: "Sleeper (SL)" },
  { value: "_3A", label: "AC 3 Tier (3A)" },
  { value: "_2A", label: "AC 2 Tier (2A)" },
  { value: "_1A", label: "AC First Class (1A)" },
  { value: "CC", label: "Chair Car (CC)" },
];

export default function Trains() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toasts, success, error, removeToast } = useToast();

  const [stations, setStations] = useState([]);
  const [trains, setTrains] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Booking modal
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedTrain, setSelectedTrain] = useState(null);
  const [seatAvailability, setSeatAvailability] = useState(null);
  const [isCheckingSeats, setIsCheckingSeats] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  const [searchForm, setSearchForm] = useState({
    source: location.state?.source || "",
    destination: location.state?.destination || "",
    date: location.state?.date || new Date().toISOString().split("T")[0],
  });

  const [bookingForm, setBookingForm] = useState({
    classType: "SL",
    seatCount: 1,
    passengers: [{ name: "", age: "", gender: "Male" }],
  });

  const isValidCode = (v) => /^[A-Z]{2,5}$/.test((v || "").toUpperCase());

  // Sanitize any incoming state (e.g., from navigation) to ensure only codes are kept
  useEffect(() => {
    setSearchForm((prev) => ({
      ...prev,
      source: isValidCode(prev.source) ? prev.source.toUpperCase() : "",
      destination: isValidCode(prev.destination)
        ? prev.destination.toUpperCase()
        : "",
    }));
  }, [stations.length]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      const [stationsRes, trainsRes] = await Promise.all([
        trainAPI.getStations(),
        trainAPI.getAllTrains(),
      ]);
      setStations(stationsRes.data);
      setTrains(trainsRes.data);
    } catch (err) {
      error("Failed to load data");
      setStations([]);
      setTrains([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchForm.source || !searchForm.destination) {
      error("Please select source and destination");
      return;
    }

    if (
      !isValidCode(searchForm.source) ||
      !isValidCode(searchForm.destination)
    ) {
      error("Invalid station selection. Please re-select stations.");
      setSearchForm({ ...searchForm, source: "", destination: "" });
      return;
    }

    try {
      setIsSearching(true);
      const res = await trainAPI.searchTrains(
        searchForm.source,
        searchForm.destination,
      );
      setTrains(res.data);
      setHasSearched(true);
      if (res.data.length === 0) {
        error("No trains found for this route");
      }
    } catch (err) {
      error("Search failed");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectTrain = async (train) => {
    if (!hasSearched) {
      error(
        "Please search with source & destination first, then select a train from those results.",
      );
      return;
    }

    if (
      !isValidCode(searchForm.source) ||
      !isValidCode(searchForm.destination)
    ) {
      error(
        "Invalid station selection. Please re-select stations and search again.",
      );
      return;
    }

    setSelectedTrain(train);
    setShowBookingModal(true);
    setBookingForm({
      classType: "SL",
      seatCount: 1,
      passengers: [{ name: "", age: "", gender: "Male" }],
    });
    setSeatAvailability(null);
    checkSeatAvailability(train.id, "SL");
  };

  const checkSeatAvailability = async (trainId, classType) => {
    if (
      !isValidCode(searchForm.source) ||
      !isValidCode(searchForm.destination)
    ) {
      error("Invalid station selection. Please re-select stations.");
      return;
    }

    try {
      setIsCheckingSeats(true);
      const res = await trainAPI.getSeatAvailability(
        trainId,
        searchForm.date,
        classType,
      );
      setSeatAvailability(res.data);
    } catch (err) {
      logger.error("Seat check failed", err);
      error(
        err.response?.data?.message ||
          "Seat availability not found for this train on this date.",
      );
      setSeatAvailability(null);
    } finally {
      setIsCheckingSeats(false);
    }
  };

  const handleClassChange = (classType) => {
    setBookingForm({ ...bookingForm, classType });
    if (selectedTrain) checkSeatAvailability(selectedTrain.id, classType);
  };

  const handlePassengerCountChange = (count) => {
    const passengers = Array.from(
      { length: count },
      (_, i) =>
        bookingForm.passengers[i] || { name: "", age: "", gender: "Male" },
    );
    setBookingForm({ ...bookingForm, seatCount: count, passengers });
  };

  const handlePassengerChange = (index, field, value) => {
    const passengers = [...bookingForm.passengers];
    passengers[index] = { ...passengers[index], [field]: value };
    setBookingForm({ ...bookingForm, passengers });
  };

  const handleBooking = async () => {
    if (!selectedTrain) return;

    if (
      !isValidCode(searchForm.source) ||
      !isValidCode(searchForm.destination)
    ) {
      error("Invalid station selection. Please re-select stations.");
      return;
    }

    const isTrainOnRoute = async (trainId, sourceCode, destinationCode) => {
      try {
        const res = await trainAPI.searchTrains(sourceCode, destinationCode);
        return (
          Array.isArray(res.data) && res.data.some((t) => t.id === trainId)
        );
      } catch (err) {
        logger.error("Route validation failed", err);
        return false;
      }
    };

    for (const p of bookingForm.passengers) {
      if (!p.name || !p.age) {
        error("Please fill in all passenger details");
        return;
      }
    }

    try {
      const onRoute = await isTrainOnRoute(
        selectedTrain.id,
        searchForm.source.toUpperCase(),
        searchForm.destination.toUpperCase(),
      );

      if (!onRoute) {
        error(
          "Selected train does not run between these stations. Please pick a listed result after searching.",
        );
        return;
      }

      setIsBooking(true);
      const payload = {
        trainId: selectedTrain.id,
        sourceStationCode: searchForm.source.toUpperCase(),
        destinationStationCode: searchForm.destination.toUpperCase(),
        travelDate: searchForm.date,
        classType: bookingForm.classType,
        seatCount: bookingForm.seatCount,
        passengers: bookingForm.passengers,
      };

      logger.debug("Booking payload", payload);

      const res = await bookingAPI.createBooking(payload);

      success(`Booking confirmed! PNR: ${res.data.pnr}`);
      setShowBookingModal(false);
      navigate("/my-bookings", { state: { newBooking: res.data } });
    } catch (err) {
      error(err.response?.data?.message || "Booking failed");
    } finally {
      setIsBooking(false);
    }
  };

  if (isLoading) return <Loader fullScreen text="Loading trains..." />;

  return (
    <div
      className="trains-page"
      style={{
        backgroundImage: `url(${authBgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        minHeight: "100vh",
      }}
    >
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Search Section */}
      <section className="search-section">
        <div className="container">
          <form
            onSubmit={handleSearch}
            className="search-form-inline glass-card"
          >
            <div className="search-field">
              <label>
                <MapPin size={16} /> From
              </label>
              <select
                value={searchForm.source}
                onChange={(e) =>
                  setSearchForm({ ...searchForm, source: e.target.value })
                }
                required
              >
                <option value="">Select Station</option>
                {stations.map((s) => (
                  <option key={s.id} value={s.code}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="search-field">
              <label>
                <MapPin size={16} /> To
              </label>
              <select
                value={searchForm.destination}
                onChange={(e) =>
                  setSearchForm({ ...searchForm, destination: e.target.value })
                }
                required
              >
                <option value="">Select Station</option>
                {stations
                  .filter((s) => s.code !== searchForm.source)
                  .map((s) => (
                    <option key={s.id} value={s.code}>
                      {s.name} ({s.code})
                    </option>
                  ))}
              </select>
            </div>

            <div className="search-field">
              <label>
                <Calendar size={16} /> Date
              </label>
              <input
                type="date"
                value={searchForm.date}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) =>
                  setSearchForm({ ...searchForm, date: e.target.value })
                }
                required
              />
            </div>

            <button className="btn btn-primary" disabled={isSearching}>
              <Search size={18} /> {isSearching ? "Searching..." : "Search"}
            </button>
          </form>
        </div>
      </section>

      {/* Trains List */}
      <section className="trains-section container">
        <h2 className="section-title">
          <Train size={24} />
          {hasSearched ? `Found ${trains.length} Trains` : "All Trains"}
        </h2>

        {isSearching ? (
          <Loader text="Searching trains..." />
        ) : trains.length ? (
          <div className="trains-grid">
            {trains.map((t) => (
              <TrainCard
                key={t.id}
                train={t}
                source={searchForm.source}
                destination={searchForm.destination}
                onSelect={handleSelectTrain}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">🚂</div>
            <h3>No trains found</h3>
            <p>Try searching with different stations or dates</p>
          </div>
        )}
      </section>

      {/* Booking Modal */}
      <Modal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        title="Book Your Ticket"
        size="lg"
      >
        {selectedTrain && (
          <div className="booking-modal-content">
            {/* Train Info */}
            <div className="selected-train-info">
              <Train size={24} color="#002f6c" />
              <div>
                <strong>
                  {selectedTrain.trainNumber} - {selectedTrain.trainName}
                </strong>
                <div className="journey-route">
                  <span>{searchForm.source}</span>
                  <ChevronRight size={16} />
                  <span>{searchForm.destination}</span>
                  <span className="date-badge">{searchForm.date}</span>
                </div>
              </div>
            </div>

            {/* Class Selection */}
            <div className="form-section">
              <label className="form-label">
                <Train size={18} /> Select Class
              </label>
              <div className="class-grid">
                {classTypes.map((ct) => (
                  <button
                    key={ct.value}
                    type="button"
                    className={`class-option ${
                      bookingForm.classType === ct.value ? "active" : ""
                    }`}
                    onClick={() => handleClassChange(ct.value)}
                  >
                    {ct.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Seat Availability */}
            {isCheckingSeats ? (
              <div className="checking-seats">Checking availability...</div>
            ) : seatAvailability ? (
              <div className="seat-info success">
                {seatAvailability.availableSeats} seats available in{" "}
                {bookingForm.classType}
              </div>
            ) : (
              <div className="seat-info error">
                Seat availability not found for this class
              </div>
            )}

            {/* Passenger Count */}
            <div className="form-section">
              <label className="form-label">
                <Users size={18} /> Number of Passengers
              </label>
              <select
                className="form-select"
                value={bookingForm.seatCount}
                onChange={(e) =>
                  handlePassengerCountChange(parseInt(e.target.value))
                }
                disabled={!seatAvailability}
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? "Passenger" : "Passengers"}
                  </option>
                ))}
              </select>
            </div>

            {/* Passenger Details */}
            <div className="form-section">
              <label className="form-label">Passenger Details</label>
              <div className="passengers-form">
                {bookingForm.passengers.map((passenger, index) => (
                  <div key={index} className="passenger-row">
                    <h4>Passenger {index + 1}</h4>
                    <div className="passenger-fields">
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={passenger.name}
                        onChange={(e) =>
                          handlePassengerChange(index, "name", e.target.value)
                        }
                        required
                      />
                      <input
                        type="number"
                        placeholder="Age"
                        value={passenger.age}
                        onChange={(e) =>
                          handlePassengerChange(index, "age", e.target.value)
                        }
                        min="1"
                        max="120"
                        required
                      />
                      <select
                        value={passenger.gender}
                        onChange={(e) =>
                          handlePassengerChange(index, "gender", e.target.value)
                        }
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="booking-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setShowBookingModal(false)}
                disabled={isBooking}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                disabled={
                  isBooking ||
                  !seatAvailability ||
                  seatAvailability.availableSeats < bookingForm.seatCount
                }
                onClick={handleBooking}
              >
                {isBooking ? "Processing..." : "Confirm Booking"}
              </button>
            </div>
          </div>
        )}
      </Modal>

      <style jsx>{`
        .trains-page {
          min-height: 100vh;
          padding-bottom: 3rem;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1.5rem;
        }

        .search-section {
          padding: 2rem 0;
        }

        .search-form-inline {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 12px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }

        .search-field {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .search-field label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          font-weight: 600;
          color: #000000;
        }

        .search-field select,
        .search-field input {
          padding: 0.75rem;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 0.95rem;
          transition: all 0.3s ease;
        }

        .search-field select:focus,
        .search-field input:focus {
          outline: none;
          border-color: #f57c00;
        }

        .trains-section {
          padding: 2rem 0;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.75rem;
          color: white;
          margin-bottom: 1.5rem;
        }

        .trains-grid {
          display: grid;
          gap: 1.5rem;
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 12px;
        }

        .empty-state-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .empty-state h3 {
          color: #000000;
          margin-bottom: 0.5rem;
        }

        .empty-state p {
          color: #000000;
        }

        /* Modal Content Styles */
        .booking-modal-content {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .selected-train-info {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: linear-gradient(135deg, #f0f4f8, #e8f0fe);
          border-radius: 8px;
          border-left: 4px solid #002f6c;
        }

        .journey-route {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          color: #000000;
          margin-top: 0.25rem;
        }

        .date-badge {
          background: #f57c00;
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .form-section {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .form-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          color: #000000;
          font-size: 1rem;
        }

        .class-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 0.75rem;
        }

        .class-option {
          padding: 0.75rem 1rem;
          background: #f5f5f5;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 500;
        }

        .class-option:hover {
          border-color: #f57c00;
          background: #fff4e6;
        }

        .class-option.active {
          background: #f57c00;
          color: white;
          border-color: #f57c00;
        }

        .checking-seats {
          text-align: center;
          padding: 1rem;
          color: #000000;
          font-style: italic;
        }

        .seat-info {
          padding: 1rem;
          border-radius: 8px;
          font-weight: 600;
          text-align: center;
        }

        .seat-info.success {
          background: #e8f5e9;
          color: #2e7d32;
        }

        .seat-info.error {
          background: #ffebee;
          color: #c62828;
        }

        .form-select {
          padding: 0.75rem;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 1rem;
          cursor: pointer;
        }

        .passengers-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .passenger-row {
          padding: 1rem;
          background: #f9f9f9;
          border-radius: 8px;
          border: 1px solid #e0e0e0;
        }

        .passenger-row h4 {
          margin-bottom: 0.75rem;
          color: #000000;
          font-size: 0.95rem;
        }

        .passenger-fields {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 0.75rem;
        }

        .passenger-fields input,
        .passenger-fields select {
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 0.95rem;
        }

        .booking-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          padding-top: 1rem;
          border-top: 1px solid #e0e0e0;
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .btn-primary {
          background: #f57c00;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #e65100;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(245, 124, 0, 0.4);
        }

        .btn-secondary {
          background: #f5f5f5;
          color: #000000;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #e0e0e0;
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .search-form-inline {
            grid-template-columns: 1fr;
          }

          .passenger-fields {
            grid-template-columns: 1fr;
          }

          .booking-actions {
            flex-direction: column;
          }

          .btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}
