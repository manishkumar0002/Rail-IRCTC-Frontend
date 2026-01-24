import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { bookingAPI, passengerAPI } from "../services/api";
import { Ticket, AlertCircle, CreditCard, CheckCircle } from "lucide-react";
import Loader from "../components/Loader";
import BookingCard from "../components/BookingCard";
import Modal from "../components/Modal";
import ToastContainer from "../components/ToastContainer";
import useToast from "../hooks/useToast";
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
      console.error("Failed to fetch bookings", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = async (booking) => {
    setSelectedBooking(booking);
    setShowDetailModal(true);

    try {
      setIsLoadingPassengers(true);
      const res = await passengerAPI.getPassengers(booking.id);
      setPassengers(res.data);
    } catch (err) {
      console.error("Passenger fetch failed", err);
    } finally {
      setIsLoadingPassengers(false);
    }
  };

  const handleProceedToPayment = (booking) => {
    if (!booking) return;
    console.log("🔵 Navigating to payment with booking:", booking);
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
    <div className="bookings-page">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="container">
        <h1 className="page-title">
          <Ticket size={28} /> My Bookings
        </h1>

        {bookings.length ? (
          <div className="bookings-grid">
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
    </div>
  );
};

export default MyBookings;
