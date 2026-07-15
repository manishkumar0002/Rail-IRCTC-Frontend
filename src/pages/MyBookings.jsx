import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { bookingAPI, passengerAPI, fareAPI, timelineAPI } from "../services/api";
import { API_BASE_URL } from "../config/api";
import { Ticket, AlertCircle, CreditCard, CheckCircle, Printer } from "lucide-react";
import Loader from "../components/Loader";
import BookingCard from "../components/BookingCard";
import Modal from "../components/Modal";
import ToastContainer from "../components/ToastContainer";
import useToast from "../hooks/useToast";
import authBgImage from "../assets/authafterimg.jpg";
import logger from "../utils/logger";
//import useToastNotification from "../hooks/useToast";

const paymentMethods = [
  { value: "UPI", label: "UPI", icon: "📱" },
  { value: "CARD", label: "Credit/Debit Card", icon: "💳" },
  { value: "NETBANKING", label: "Net Banking", icon: "🏦" },
  { value: "WALLET", label: "Wallet", icon: "👛" },
];

const MyBookings = () => {
  const navigate = useNavigate();
  const { toasts, success, error, removeToast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [passengers, setPassengers] = useState([]);
  const [fareBreakdown, setFareBreakdown] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [isLoadingPassengers, setIsLoadingPassengers] = useState(false);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const res = await bookingAPI.getMyBookings();
      setBookings(res.data);
    } catch (err) {
      logger.error("Failed to fetch bookings", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = async (booking) => {
    setSelectedBooking(booking);
    setPassengers([]);
    setFareBreakdown(null);
    setTimeline([]);
    setShowDetailModal(true);

    try {
      setIsLoadingPassengers(true);
      
      const results = await Promise.allSettled([
        passengerAPI.getPassengers(booking.id),
        fareAPI.getFareBreakdown(booking.id),
        timelineAPI.getTimeline(booking.id)
      ]);

      const [passengersRes, fareRes, timelineRes] = results;

      if (passengersRes.status === "fulfilled") {
        setPassengers(passengersRes.value.data?.data || passengersRes.value.data || []);
      }
      if (fareRes.status === "fulfilled") {
        setFareBreakdown(fareRes.value.data?.data || fareRes.value.data || null);
      }
      if (timelineRes.status === "fulfilled") {
        setTimeline(timelineRes.value.data?.data || timelineRes.value.data || []);
      }
    } catch (err) {
      logger.error("Details fetch failed", err);
    } finally {
      setIsLoadingPassengers(false);
    }
  };

  const handleProceedToPayment = (booking) => {
    if (!booking) return;
    logger.debug("Navigating to payment with booking", booking);
    navigate("/payment", {
      state: {
        booking,
        train: {
          trainNumber: booking.trainNumber,
          trainName: booking.trainName,
        },
        source: booking.sourceStationCode,
        destination: booking.destinationStationCode,
        date: booking.travelDate,
      },
    });
  };

  const handleCancelBooking = async () => {
    if (!bookingToCancel) return;

    try {
      setIsCancelling(true);
      await bookingAPI.cancelBooking(bookingToCancel);
      success("Booking cancelled");
      setShowCancelModal(false);
      fetchBookings();
    } catch (err) {
      error("Cancellation failed");
    } finally {
      setIsCancelling(false);
      setBookingToCancel(null);
    }
  };

  if (isLoading) {
    return <Loader fullScreen text="Loading your bookings..." />;
  }

  return (
    <div
      className="bookings-page"
      style={{
        backgroundImage: `url(${authBgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        minHeight: "100vh",
      }}
    >
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="container px-4 md:px-6 lg:px-8">
        <h1 className="page-title text-2xl md:text-3xl flex items-center gap-2 mb-6">
          <Ticket size={24} className="md:w-[28px] md:h-[28px]" />{" "}
          <span>My Bookings</span>
        </h1>

        {bookings.length ? (
          <div className="bookings-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {bookings.map((booking) => (
              <div key={booking.id}>
                <BookingCard
                  booking={booking}
                  onViewDetails={handleViewDetails}
                  onCancel={(id) => {
                    setBookingToCancel(id);
                    setShowCancelModal(true);
                  }}
                />

                {(() => {
                  const status = (booking.status || "").toLowerCase();
                  const paymentPendingStatuses = [
                    "pending",
                    "payment_pending",
                    "awaiting_payment",
                  ];
                  if (paymentPendingStatuses.includes(status)) {
                    return (
                      <button
                        className="btn btn-primary w-full"
                        onClick={() => handleProceedToPayment(booking)}
                      >
                        <CreditCard size={18} /> Proceed to Pay
                      </button>
                    );
                  }
                  return null;
                })()}
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">No bookings yet</div>
        )}
      </div>

      {/* CANCEL MODAL */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => !isCancelling && setShowCancelModal(false)}
        title="Cancel Booking"
      >
        <AlertCircle size={48} />
        <p>Are you sure?</p>

        <div className="flex gap-4 justify-center mt-4">
          <button
            className="btn btn-ghost"
            onClick={() => setShowCancelModal(false)}
          >
            No
          </button>
          <button
            className="btn btn-danger"
            onClick={handleCancelBooking}
            disabled={isCancelling}
          >
            {isCancelling ? "Cancelling..." : "Yes Cancel"}
          </button>
        </div>
      </Modal>

      {/* DETAIL MODAL */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Ticket & Journey Details"
        size="lg"
      >
        {selectedBooking && (
          <div className="booking-details-modal overflow-y-auto max-h-[75vh] p-2">
            <div className="flex justify-between items-start border-b pb-4 mb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-800">
                  PNR: {selectedBooking.pnr}
                </h3>
                <p className="text-sm text-slate-500">
                  Train: {selectedBooking.trainNumber || selectedBooking.train?.trainNumber} - {selectedBooking.trainName || selectedBooking.train?.trainName}
                </p>
              </div>
              <div className="text-right">
                <span className={`status-pill px-3 py-1 rounded-full text-xs font-semibold ${selectedBooking.status === "CONFIRMED" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                  {selectedBooking.status}
                </span>
                <p className="text-xs text-slate-400 mt-1">Travel Date: {selectedBooking.travelDate}</p>
              </div>
            </div>

            {isLoadingPassengers ? (
              <Loader text="Fetching details..." />
            ) : (
              <div>
                {/* Passengers List */}
                <div className="mb-6">
                  <h4 className="font-bold text-slate-700 mb-2 border-b pb-1">Passenger Allocations</h4>
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Age/Gender</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Seat / Berth</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                      {passengers.map((p, i) => (
                        <tr key={i}>
                          <td className="px-4 py-2 text-sm text-slate-800">{p.name}</td>
                          <td className="px-4 py-2 text-sm text-slate-500">{p.age} / {p.gender}</td>
                          <td className="px-4 py-2 text-sm font-semibold text-slate-800">
                            {p.seatNumber || "PENDING"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Fare Breakdown */}
                {fareBreakdown && (
                  <div className="mb-6 bg-slate-50 p-4 rounded-lg">
                    <h4 className="font-bold text-slate-700 mb-2 border-b pb-1">Fare Breakdown</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between"><span>Base Fare:</span><span>₹{fareBreakdown.baseFare}</span></div>
                      <div className="flex justify-between"><span>Surcharges / Tatkal:</span><span>₹{fareBreakdown.surcharge}</span></div>
                      <div className="flex justify-between"><span>GST:</span><span>₹{fareBreakdown.gst}</span></div>
                      <div className="flex justify-between"><span>Convenience Fee:</span><span>₹{fareBreakdown.convenienceFee}</span></div>
                      <div className="flex justify-between"><span>Insurance:</span><span>₹{fareBreakdown.insuranceFee}</span></div>
                      <div className="flex justify-between text-red-600"><span>Concessions / Discounts:</span><span>-₹{fareBreakdown.discounts}</span></div>
                      <div className="flex justify-between font-bold border-t pt-1 text-slate-800 text-base">
                        <span>Total Paid Amount:</span>
                        <span>₹{fareBreakdown.totalFare}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Activity Timeline */}
                {timeline && timeline.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-bold text-slate-700 mb-3 border-b pb-1">Activity Timeline</h4>
                    <div className="relative pl-6 border-l-2 border-slate-200 ml-3 space-y-4">
                      {timeline.map((t, i) => (
                        <div key={i} className="relative">
                          <span className="absolute -left-[31px] top-1 bg-blue-600 text-white rounded-full w-4 h-4 flex items-center justify-center border-2 border-white"></span>
                          <h5 className="font-bold text-slate-700 text-sm">{t.eventName}</h5>
                          <p className="text-xs text-slate-500">{t.description}</p>
                          <span className="text-[10px] text-slate-400">{new Date(t.timestamp).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Print Link */}
                <div className="text-center mt-6">
                  <a
                    href={`${API_BASE_URL}/api/public/v1/tickets/${selectedBooking.id}/print`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-bold py-2.5 px-6 rounded-lg shadow-md transition-colors"
                  >
                    <Printer size={18} />
                    Print E-Ticket / PDF
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MyBookings;
