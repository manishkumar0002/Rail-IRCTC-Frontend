import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { bookingAPI, passengerAPI, fareAPI, timelineAPI } from "../services/api";
import { API_BASE_URL } from "../config/api";
import { Ticket, AlertCircle, CreditCard, CheckCircle, Printer, Users, X, Train } from "lucide-react";
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
  const location = useLocation();
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
    fetchBookings().then((fetched) => {
      if (location.state?.searchPnr && fetched) {
        const found = fetched.find(b => b.pnr === location.state.searchPnr);
        if (found) {
          handleViewDetails(found);
        }
      }
    });
  }, [location.state]);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const res = await bookingAPI.getMyBookings();
      setBookings(res.data);
      return res.data;
    } catch (err) {
      logger.error("Failed to fetch bookings", err);
      return null;
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
          <div className="booking-details-modal text-slate-800 p-1 max-h-[80vh] overflow-y-auto">
            {/* Main Grid: Left side (Ticket details & Timeline) - Right side (Actions & Price summary) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column (Ticket Details) */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* 1. Booking Status Header Card */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl p-6 shadow-md flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2.5 rounded-full">
                      <CheckCircle className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold tracking-wide">
                        {selectedBooking.status === "CANCELLED" ? "Booking Cancelled" : "Booking Confirmed"}
                      </h2>
                      <p className="text-xs text-white/80 mt-0.5">Transaction ID: TXN{selectedBooking.id}9402011</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wider text-white/70">PNR Number</p>
                    <p className="text-2xl font-extrabold tracking-widest mt-0.5">{selectedBooking.pnr}</p>
                  </div>
                </div>

                {/* 2. Stations & Journey Banner */}
                <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm">
                  <div className="flex justify-between items-center">
                    {/* From Station */}
                    <div className="text-left w-1/3">
                      <p className="text-xs text-slate-400 font-semibold uppercase">From</p>
                      <h3 className="text-2xl font-black text-slate-800">{selectedBooking.sourceStationCode}</h3>
                      <p className="text-xs text-slate-500 truncate mt-0.5">Station Area Code</p>
                      <p className="text-sm font-bold text-blue-700 mt-1">06:00 | Mon, 12 Aug</p>
                    </div>

                    {/* Train Line visual */}
                    <div className="flex flex-col items-center justify-center w-1/3">
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">06h 30m</span>
                      <div className="relative w-full flex items-center justify-center my-2">
                        <span className="absolute left-0 w-2 h-2 rounded-full bg-slate-300"></span>
                        <span className="w-full h-0.5 border-t border-dashed border-slate-300"></span>
                        <Train className="absolute text-slate-400 bg-white px-1 w-6 h-6" />
                        <span className="absolute right-0 w-2 h-2 rounded-full bg-slate-300"></span>
                      </div>
                      <span className="text-xs font-bold text-slate-700">{selectedBooking.trainNumber || "12004"} SHATABDI EXP</span>
                    </div>

                    {/* To Station */}
                    <div className="text-right w-1/3">
                      <p className="text-xs text-slate-400 font-semibold uppercase">To</p>
                      <h3 className="text-2xl font-black text-slate-800">{selectedBooking.destinationStationCode}</h3>
                      <p className="text-xs text-slate-500 truncate mt-0.5">Destination Terminus</p>
                      <p className="text-sm font-bold text-blue-700 mt-1">12:30 | Mon, 12 Aug</p>
                    </div>
                  </div>
                </div>

                {/* 3. Passengers Table */}
                <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden">
                  <div className="bg-slate-50 px-4 py-2 border-b border-slate-100">
                    <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider">Passenger Allocations</h4>
                  </div>
                  <table className="min-w-full divide-y divide-slate-100">
                    <thead>
                      <tr className="bg-slate-50/50 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        <th className="px-4 py-2.5 text-left">Passenger Name</th>
                        <th className="px-4 py-2.5 text-left">Age / Gender</th>
                        <th className="px-4 py-2.5 text-left">Quota</th>
                        <th className="px-4 py-2.5 text-left">Status / Seat</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100 text-sm">
                      {passengers.map((p, i) => (
                        <tr key={i} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 font-semibold text-slate-800">{p.name}</td>
                          <td className="px-4 py-3 text-slate-500">{p.age} / {p.gender}</td>
                          <td className="px-4 py-3 text-slate-500">General</td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-bold bg-green-50 text-green-700">
                              CNF
                            </span>
                            <span className="ml-2 font-bold text-slate-800">
                              {p.seatNumber || "C2, 42 (Window)"}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {passengers.length === 0 && (
                        <tr>
                          <td colSpan="4" className="px-4 py-4 text-center text-slate-400 text-xs">No passengers allocated yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* 4. Travel Class, Boarding and QR Verification */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white border border-slate-100 rounded-xl p-6 shadow-sm">
                  <div className="md:col-span-2 space-y-4">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">Travel Class</p>
                      <p className="text-sm font-bold text-slate-800">{selectedBooking.classType === "EC" || selectedBooking.classType === "1A" ? "Executive Anubhuti Class (EA)" : "A/C Sleeper / Chair Car"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">Boarding Stn</p>
                      <p className="text-sm font-semibold text-slate-700">{selectedBooking.sourceStationCode} - Platform 2</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">Chart Status</p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 mt-1">
                        Chart status: Chart Not Prepared
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <div className="w-24 h-24 bg-white p-1 rounded-lg border flex items-center justify-center">
                      <svg className="w-20 h-20 text-slate-800" viewBox="0 0 100 100">
                        <path d="M10 10h30v30H10zm5 5h20v20H15zm45-5h30v30H60zm5 5h20v20H65zM10 60h30v30H10zm5 5h20v20H15zm55 5h10v10H70zm10-10h10v10H80zm-10-10h10v10H70zm20 20h10v10H90zm-10 10h10v10H80zm10-20h10v10H90z" fill="currentColor"/>
                      </svg>
                    </div>
                    <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-400 mt-2">Scan For Verification</span>
                  </div>
                </div>

                {/* 5. Journey Timeline Tracker */}
                <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm">
                  <h4 className="font-bold text-slate-800 text-sm mb-6 border-b pb-2">Journey Timeline</h4>
                  <div className="relative flex justify-between items-center px-6">
                    <div className="absolute left-6 right-6 top-[7px] h-0.5 bg-slate-100 z-0"></div>
                    
                    <div className="flex flex-col items-center z-10">
                      <div className="w-4 h-4 rounded-full bg-blue-600 border-4 border-white shadow-sm"></div>
                      <span className="text-xs font-bold text-slate-700 mt-2">06:00</span>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wide">{selectedBooking.sourceStationCode}</span>
                    </div>

                    <div className="flex flex-col items-center z-10">
                      <div className="w-4 h-4 rounded-full bg-slate-300 border-4 border-white shadow-sm"></div>
                      <span className="text-xs font-bold text-slate-500 mt-2">08:15</span>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wide">CNB</span>
                    </div>

                    <div className="flex flex-col items-center z-10">
                      <div className="w-4 h-4 rounded-full bg-slate-300 border-4 border-white shadow-sm"></div>
                      <span className="text-xs font-bold text-slate-500 mt-2">10:45</span>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wide">ETW</span>
                    </div>

                    <div className="flex flex-col items-center z-10">
                      <div className="w-4 h-4 rounded-full bg-slate-300 border-4 border-white shadow-sm"></div>
                      <span className="text-xs font-bold text-slate-500 mt-2">12:30</span>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wide">{selectedBooking.destinationStationCode}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column (Actions & Billing Summary) */}
              <div className="space-y-6">
                
                <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm space-y-3">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2">Actions</h4>
                  
                  <a
                    href={`${API_BASE_URL}/api/public/v1/tickets/${selectedBooking.id}/print`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex justify-between items-center w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl shadow-sm transition-colors text-sm"
                  >
                    <span className="flex items-center gap-2">
                      <Printer size={16} />
                      Download E-Ticket
                    </span>
                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-bold">PDF</span>
                  </a>

                  <button
                    onClick={() => {
                      const shareText = `Confirmed Ticket! PNR: ${selectedBooking.pnr}, Train: ${selectedBooking.trainNumber}. Status: CNF.`;
                      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, "_blank");
                    }}
                    className="flex items-center justify-center gap-2 w-full border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold py-3 px-4 rounded-xl transition-colors text-sm"
                  >
                    Share via WhatsApp
                  </button>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={() => {
                        setShowDetailModal(false);
                        setBookingToCancel(selectedBooking.id);
                        setShowCancelModal(true);
                      }}
                      className="border border-red-100 hover:bg-red-50 text-red-600 font-semibold py-2.5 px-3 rounded-lg text-xs transition-colors flex flex-col items-center gap-1"
                    >
                      <X size={14} />
                      Cancel
                    </button>
                    <button
                      onClick={() => alert("TDR filing requests can be initiated after chart preparation.")}
                      className="border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold py-2.5 px-3 rounded-lg text-xs transition-colors flex flex-col items-center gap-1"
                    >
                      File TDR
                    </button>
                  </div>
                </div>

                <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm space-y-4">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b pb-2">Payment Summary</h4>
                  {fareBreakdown ? (
                    <div className="space-y-2 text-sm text-slate-600">
                      <div className="flex justify-between">
                        <span>Base Fare (x{selectedBooking.seatCount}):</span>
                        <span className="font-semibold text-slate-800">₹{(fareBreakdown.baseFare || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Catering / Surcharges:</span>
                        <span className="font-semibold text-slate-800">₹{(fareBreakdown.surcharge || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Convenience Fee + GST:</span>
                        <span className="font-semibold text-slate-800">₹{((fareBreakdown.gst || 0) + (fareBreakdown.convenienceFee || 0)).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border-t pt-3 font-extrabold text-blue-700 text-lg">
                        <span>Total Paid Amount:</span>
                        <span>₹{(fareBreakdown.totalFare || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 text-sm text-slate-600">
                      <div className="flex justify-between">
                        <span>Ticket Base Cost:</span>
                        <span className="font-semibold text-slate-800">₹{((selectedBooking.seatCount || 1) * 1710).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border-t pt-3 font-extrabold text-blue-700 text-lg">
                        <span>Total Paid Amount:</span>
                        <span>₹{((selectedBooking.seatCount || 1) * 1710 + 118).toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl p-5 shadow-sm space-y-3 relative overflow-hidden">
                  <div className="relative z-10">
                    <h4 className="font-bold text-indigo-900 text-sm">Need Assistance?</h4>
                    <p className="text-xs text-indigo-700/80 mt-1 leading-relaxed">
                      Our enterprise support desk is available 24/7 for premium bookings.
                    </p>
                    <a
                      href="tel:139"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-800 mt-3"
                    >
                      Contact Helpdesk
                    </a>
                  </div>
                  <div className="absolute right-2 bottom-2 text-indigo-200/40 pointer-events-none">
                    <Users size={64} />
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MyBookings;
