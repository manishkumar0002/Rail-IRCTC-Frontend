import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { adminAPI } from "../services/api";
import {
  Settings,
  Train,
  MapPin,
  Route,
  Armchair,
  Ticket,
  CreditCard,
  Plus,
  ChevronDown,
  ChevronUp,
  Trash2,
  Eye,
} from "lucide-react";
import Loader from "../components/Loader";
import ToastContainer from "../components/ToastContainer";
import useToast from "../hooks/useToast";
import Modal from "../components/Modal";

const AdminTools = () => {
  const { isAdmin } = useAuth();
  const { toasts, success, error, removeToast } = useToast();
  const [activeSection, setActiveSection] = useState("trains");
  const [isLoading, setIsLoading] = useState(true);

  // Data states
  const [trains, setTrains] = useState([]);
  const [stations, setStations] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [routes, setRoutes] = useState({});

  // Form states
  const [trainForm, setTrainForm] = useState({
    trainNumber: "",
    trainName: "",
    totalSeats: 0,
  });

  const [stationForm, setStationForm] = useState({
    code: "",
    name: "",
  });

  const [routeForm, setRouteForm] = useState({
    trainId: "",
    stationCode: "",
    stopOrder: 1,
    halt: true,
  });

  const [seatForm, setSeatForm] = useState({
    trainId: "",
    travelDate: "",
    classType: "SL",
    seats: 100,
  });

  // Modal states
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [selectedTrainRoute, setSelectedTrainRoute] = useState(null);

  useEffect(() => {
    if (isAdmin) {
      fetchAllData();
    }
  }, [isAdmin]);

  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      const [trainsRes, stationsRes, bookingsRes, paymentsRes] = await Promise.all([
        adminAPI.getTrains(),
        adminAPI.getStations(),
        adminAPI.getAllBookings(),
        adminAPI.getAllPayments(),
      ]);
      setTrains(trainsRes.data);
      setStations(stationsRes.data);
      setBookings(bookingsRes.data);
      setPayments(paymentsRes.data);
    } catch (err) {
      console.error("Failed to fetch admin data:", err);
      error("Failed to load admin data");
    } finally {
      setIsLoading(false);
    }
  };

  // ============= TRAINS =============
  const handleAddTrain = async (e) => {
    e.preventDefault();
    if (!trainForm.trainNumber || !trainForm.trainName || !trainForm.totalSeats) {
      error("Please fill all train details");
      return;
    }
    try {
      await adminAPI.addTrain(trainForm);
      success("✅ Train added successfully!");
      setTrainForm({ trainNumber: "", trainName: "", totalSeats: 0 });
      fetchAllData();
    } catch (err) {
      error(err.response?.data?.message || "Failed to add train");
    }
  };

  // ============= STATIONS =============
  const handleAddStation = async (e) => {
    e.preventDefault();
    if (!stationForm.code || !stationForm.name) {
      error("Please fill all station details");
      return;
    }
    try {
      await adminAPI.addStation(stationForm);
      success("✅ Station added successfully!");
      setStationForm({ code: "", name: "" });
      fetchAllData();
    } catch (err) {
      error(err.response?.data?.message || "Failed to add station");
    }
  };

  // ============= ROUTES =============
  const handleViewRoute = async (trainId) => {
    try {
      const res = await adminAPI.getRoute(trainId);
      setSelectedTrainRoute({
        trainId,
        stops: res.data,
        train: trains.find((t) => t.id === trainId),
      });
      setShowRouteModal(true);
    } catch (err) {
      error("Failed to fetch route details");
    }
  };

  const handleAddStop = async (e) => {
    e.preventDefault();
    if (!routeForm.trainId || !routeForm.stationCode) {
      error("Please select train and station");
      return;
    }
    try {
      await adminAPI.addStop(
        routeForm.trainId,
        routeForm.stationCode,
        routeForm.stopOrder,
        routeForm.halt
      );
      success("✅ Route stop added successfully!");
      setRouteForm({
        trainId: routeForm.trainId,
        stationCode: "",
        stopOrder: routeForm.stopOrder + 1,
        halt: true,
      });
      // Refresh route
      handleViewRoute(routeForm.trainId);
    } catch (err) {
      error(err.response?.data?.message || "Failed to add route stop");
    }
  };

  const handleDeleteStop = async (stopId) => {
    if (!window.confirm("Are you sure you want to delete this stop?")) return;
    try {
      await adminAPI.deleteStop(stopId);
      success("✅ Stop deleted successfully!");
      if (selectedTrainRoute) {
        handleViewRoute(selectedTrainRoute.trainId);
      }
    } catch (err) {
      error("Failed to delete stop");
    }
  };

  // ============= SEATS =============
  const handleInitSeats = async (e) => {
    e.preventDefault();
    if (!seatForm.trainId || !seatForm.travelDate || !seatForm.seats) {
      error("Please fill all seat details");
      return;
    }
    try {
      await adminAPI.initializeSeats(
        seatForm.trainId,
        seatForm.travelDate,
        seatForm.classType,
        seatForm.seats
      );
      success("✅ Seats initialized successfully!");
      setSeatForm({
        trainId: "",
        travelDate: "",
        classType: "SL",
        seats: 100,
      });
    } catch (err) {
      error(err.response?.data?.message || "Failed to initialize seats");
    }
  };

  const toggleSection = (section) => {
    setActiveSection(activeSection === section ? null : section);
  };

  if (!isAdmin) {
    return (
      <div className="admin-page">
        <div className="container">
          <div className="no-access">
            <Settings size={64} />
            <h2>Access Denied</h2>
            <p>You don't have admin privileges to access this page.</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <Loader fullScreen text="Loading admin tools..." />;
  }

  return (
    <div className="admin-page">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="container">
        {/* PAGE HEADER */}
        <div className="admin-page-header">
          <div className="admin-title-section">
            <Settings size={32} />
            <div>
              <h1>Admin Dashboard</h1>
              <p>Manage trains, stations, routes, bookings & payments</p>
            </div>
          </div>
        </div>

        {/* ADMIN SECTIONS */}
        <div className="admin-sections-container">
          {/* ============= TRAINS SECTION ============= */}
          <div className="admin-section">
            <button
              className={`section-header ${activeSection === "trains" ? "active" : ""}`}
              onClick={() => toggleSection("trains")}
            >
              <div className="section-title">
                <Train size={22} />
                <span>Manage Trains</span>
                <span className="badge">{trains.length}</span>
              </div>
              {activeSection === "trains" ? (
                <ChevronUp size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </button>

            {activeSection === "trains" && (
              <div className="section-content">
                {/* ADD TRAIN FORM */}
                <div className="form-card">
                  <h3>Add New Train</h3>
                  <form onSubmit={handleAddTrain}>
                    <div className="form-row">
                      <input
                        type="text"
                        placeholder="Train Number (e.g., 12345)"
                        value={trainForm.trainNumber}
                        onChange={(e) =>
                          setTrainForm({ ...trainForm, trainNumber: e.target.value })
                        }
                      />
                      <input
                        type="text"
                        placeholder="Train Name (e.g., Rajdhani Express)"
                        value={trainForm.trainName}
                        onChange={(e) =>
                          setTrainForm({ ...trainForm, trainName: e.target.value })
                        }
                      />
                      <input
                        type="number"
                        placeholder="Total Seats"
                        value={trainForm.totalSeats}
                        onChange={(e) =>
                          setTrainForm({ ...trainForm, totalSeats: parseInt(e.target.value) })
                        }
                      />
                      <button type="submit" className="btn btn-primary">
                        <Plus size={16} /> Add Train
                      </button>
                    </div>
                  </form>
                </div>

                {/* TRAINS LIST */}
                <div className="data-card">
                  <h3>Existing Trains ({trains.length})</h3>
                  {trains.length > 0 ? (
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Number</th>
                          <th>Name</th>
                          <th>Total Seats</th>
                        </tr>
                      </thead>
                      <tbody>
                        {trains.map((train) => (
                          <tr key={train.id}>
                            <td>{train.id}</td>
                            <td>{train.trainNumber}</td>
                            <td>{train.trainName}</td>
                            <td>{train.totalSeats}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="empty-message">No trains added yet</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ============= STATIONS SECTION ============= */}
          <div className="admin-section">
            <button
              className={`section-header ${activeSection === "stations" ? "active" : ""}`}
              onClick={() => toggleSection("stations")}
            >
              <div className="section-title">
                <MapPin size={22} />
                <span>Manage Stations</span>
                <span className="badge">{stations.length}</span>
              </div>
              {activeSection === "stations" ? (
                <ChevronUp size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </button>

            {activeSection === "stations" && (
              <div className="section-content">
                {/* ADD STATION FORM */}
                <div className="form-card">
                  <h3>Add New Station</h3>
                  <form onSubmit={handleAddStation}>
                    <div className="form-row">
                      <input
                        type="text"
                        placeholder="Station Code (e.g., DEL)"
                        value={stationForm.code}
                        onChange={(e) =>
                          setStationForm({ ...stationForm, code: e.target.value })
                        }
                      />
                      <input
                        type="text"
                        placeholder="Station Name (e.g., Delhi Central)"
                        value={stationForm.name}
                        onChange={(e) =>
                          setStationForm({ ...stationForm, name: e.target.value })
                        }
                      />
                      <button type="submit" className="btn btn-primary">
                        <Plus size={16} /> Add Station
                      </button>
                    </div>
                  </form>
                </div>

                {/* STATIONS LIST */}
                <div className="data-card">
                  <h3>Existing Stations ({stations.length})</h3>
                  {stations.length > 0 ? (
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Code</th>
                          <th>Name</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stations.map((station) => (
                          <tr key={station.id}>
                            <td>{station.id}</td>
                            <td className="code">{station.code}</td>
                            <td>{station.name}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="empty-message">No stations added yet</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ============= ROUTES SECTION ============= */}
          <div className="admin-section">
            <button
              className={`section-header ${activeSection === "routes" ? "active" : ""}`}
              onClick={() => toggleSection("routes")}
            >
              <div className="section-title">
                <Route size={22} />
                <span>Define Routes</span>
              </div>
              {activeSection === "routes" ? (
                <ChevronUp size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </button>

            {activeSection === "routes" && (
              <div className="section-content">
                {/* ROUTE FORM */}
                <div className="form-card">
                  <h3>Add Route Stop</h3>
                  <form onSubmit={handleAddStop}>
                    <div className="form-row">
                      <select
                        value={routeForm.trainId}
                        onChange={(e) =>
                          setRouteForm({ ...routeForm, trainId: e.target.value })
                        }
                      >
                        <option value="">Select Train</option>
                        {trains.map((train) => (
                          <option key={train.id} value={train.id}>
                            {train.trainNumber} - {train.trainName}
                          </option>
                        ))}
                      </select>

                      <select
                        value={routeForm.stationCode}
                        onChange={(e) =>
                          setRouteForm({ ...routeForm, stationCode: e.target.value })
                        }
                      >
                        <option value="">Select Station</option>
                        {stations.map((station) => (
                          <option key={station.id} value={station.code}>
                            {station.code} - {station.name}
                          </option>
                        ))}
                      </select>

                      <input
                        type="number"
                        placeholder="Stop Order"
                        value={routeForm.stopOrder}
                        onChange={(e) =>
                          setRouteForm({
                            ...routeForm,
                            stopOrder: parseInt(e.target.value),
                          })
                        }
                        min="1"
                      />

                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={routeForm.halt}
                          onChange={(e) =>
                            setRouteForm({ ...routeForm, halt: e.target.checked })
                          }
                        />
                        Halt
                      </label>

                      <button type="submit" className="btn btn-primary">
                        <Plus size={16} /> Add Stop
                      </button>
                    </div>
                  </form>
                </div>

                {/* ROUTES LIST */}
                <div className="data-card">
                  <h3>Train Routes</h3>
                  {trains.length > 0 ? (
                    <div className="routes-grid">
                      {trains.map((train) => (
                        <button
                          key={train.id}
                          className="route-card"
                          onClick={() => handleViewRoute(train.id)}
                        >
                          <Eye size={16} />
                          <strong>{train.trainNumber}</strong>
                          <small>{train.trainName}</small>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="empty-message">No trains available</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ============= SEATS SECTION ============= */}
          <div className="admin-section">
            <button
              className={`section-header ${activeSection === "seats" ? "active" : ""}`}
              onClick={() => toggleSection("seats")}
            >
              <div className="section-title">
                <Armchair size={22} />
                <span>Initialize Seats</span>
              </div>
              {activeSection === "seats" ? (
                <ChevronUp size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </button>

            {activeSection === "seats" && (
              <div className="section-content">
                {/* SEAT FORM */}
                <div className="form-card">
                  <h3>Initialize Seat Availability</h3>
                  <form onSubmit={handleInitSeats}>
                    <div className="form-row">
                      <select
                        value={seatForm.trainId}
                        onChange={(e) =>
                          setSeatForm({ ...seatForm, trainId: e.target.value })
                        }
                      >
                        <option value="">Select Train</option>
                        {trains.map((train) => (
                          <option key={train.id} value={train.id}>
                            {train.trainNumber} - {train.trainName}
                          </option>
                        ))}
                      </select>

                      <input
                        type="date"
                        value={seatForm.travelDate}
                        onChange={(e) =>
                          setSeatForm({ ...seatForm, travelDate: e.target.value })
                        }
                      />

                      <select
                        value={seatForm.classType}
                        onChange={(e) =>
                          setSeatForm({ ...seatForm, classType: e.target.value })
                        }
                      >
                        <option value="SL">Sleeper (SL)</option>
                        <option value="3A">AC 3 Tier (3A)</option>
                        <option value="2A">AC 2 Tier (2A)</option>
                        <option value="1A">AC First (1A)</option>
                        <option value="CC">Chair Car (CC)</option>
                      </select>

                      <input
                        type="number"
                        placeholder="Number of Seats"
                        value={seatForm.seats}
                        onChange={(e) =>
                          setSeatForm({ ...seatForm, seats: parseInt(e.target.value) })
                        }
                        min="1"
                      />

                      <button type="submit" className="btn btn-primary">
                        <Plus size={16} /> Initialize
                      </button>
                    </div>
                  </form>
                </div>

                <div className="info-box">
                  <p>
                    💡 Use this to set available seats for a train on a specific date
                    and class type.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ============= BOOKINGS SECTION ============= */}
          <div className="admin-section">
            <button
              className={`section-header ${activeSection === "bookings" ? "active" : ""}`}
              onClick={() => toggleSection("bookings")}
            >
              <div className="section-title">
                <Ticket size={22} />
                <span>All Bookings</span>
                <span className="badge">{bookings.length}</span>
              </div>
              {activeSection === "bookings" ? (
                <ChevronUp size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </button>

            {activeSection === "bookings" && (
              <div className="section-content">
                <div className="data-card">
                  {bookings.length > 0 ? (
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>PNR</th>
                          <th>Train ID</th>
                          <th>From</th>
                          <th>To</th>
                          <th>Date</th>
                          <th>Class</th>
                          <th>Seats</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.map((booking) => (
                          <tr key={booking.id}>
                            <td className="pnr">{booking.pnr}</td>
                            <td>{booking.trainId}</td>
                            <td>{booking.sourceStationCode}</td>
                            <td>{booking.destinationStationCode}</td>
                            <td>{booking.travelDate}</td>
                            <td>{booking.classType}</td>
                            <td>{booking.seatCount}</td>
                            <td>
                              <span className={`status ${booking.status.toLowerCase()}`}>
                                {booking.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="empty-message">No bookings yet</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ============= PAYMENTS SECTION ============= */}
          <div className="admin-section">
            <button
              className={`section-header ${activeSection === "payments" ? "active" : ""}`}
              onClick={() => toggleSection("payments")}
            >
              <div className="section-title">
                <CreditCard size={22} />
                <span>Payment History</span>
                <span className="badge">{payments.length}</span>
              </div>
              {activeSection === "payments" ? (
                <ChevronUp size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </button>

            {activeSection === "payments" && (
              <div className="section-content">
                <div className="data-card">
                  {payments.length > 0 ? (
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Booking ID</th>
                          <th>Amount</th>
                          <th>Status</th>
                          <th>Method</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.map((payment) => (
                          <tr key={payment.id}>
                            <td>{payment.id}</td>
                            <td>{payment.bookingId}</td>
                            <td>₹{payment.amount}</td>
                            <td>
                              <span className={`status ${payment.status.toLowerCase()}`}>
                                {payment.status}
                              </span>
                            </td>
                            <td>{payment.paymentMethod}</td>
                            <td>{payment.createdAt}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="empty-message">No payments yet</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ROUTE MODAL */}
      <Modal
        isOpen={showRouteModal}
        onClose={() => setShowRouteModal(false)}
        title="Train Route Details"
        size="lg"
      >
        {selectedTrainRoute && (
          <div className="route-modal-content">
            <div className="route-info">
              <h3>
                {selectedTrainRoute.train.trainNumber} -{" "}
                {selectedTrainRoute.train.trainName}
              </h3>
              <p>Total Stops: {selectedTrainRoute.stops.length}</p>
            </div>

            {selectedTrainRoute.stops.length > 0 ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Stop Order</th>
                    <th>Station Code</th>
                    <th>Station Name</th>
                    <th>Halt</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedTrainRoute.stops.map((stop) => (
                    <tr key={stop.id}>
                      <td>{stop.stopOrder}</td>
                      <td>{stop.station.code}</td>
                      <td>{stop.station.name}</td>
                      <td>{stop.halt ? "✅ Yes" : "❌ No"}</td>
                      <td>
                        <button
                          className="btn btn-danger btn-small"
                          onClick={() => handleDeleteStop(stop.id)}
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="empty-message">No stops defined for this route</p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminTools;
