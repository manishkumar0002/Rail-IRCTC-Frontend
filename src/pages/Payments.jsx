import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { paymentAPI, adminAPI } from "../services/api";
import {
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Hash,
  Train,
  MapPin,
  Users,
  ArrowRight,
  Wallet,
  Building2,
  Smartphone,
  AlertCircle,
} from "lucide-react";
import Loader from "../components/Loader";
import authBgImage from "../assets/authafterimg.jpg";

export default function Payments() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  
  // For admin view
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  
  // For user payment
  const [booking, setBooking] = useState(location.state?.booking || null);
  const [trainDetails, setTrainDetails] = useState(location.state?.train || null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null); // 'success', 'failed', null

  const paymentMethods = [
    { id: "card", name: "Credit/Debit Card", icon: CreditCard },
    { id: "upi", name: "UPI", icon: Smartphone },
    { id: "netbanking", name: "Net Banking", icon: Building2 },
    { id: "wallet", name: "Wallet", icon: Wallet },
  ];

  // ✅ DEFINE renderStyles EARLY (before any JSX return)
  const renderStyles = () => (
    <style>{`
      .payments-page {
        min-height: calc(100vh - 70px);
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 2rem 1rem;
      }

      .container {
        max-width: 1200px;
        margin: 0 auto;
      }

      /* Error Container */
      .error-container {
        text-align: center;
        padding: 4rem 2rem;
        background: white;
        border-radius: 20px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
        max-width: 600px;
        margin: 0 auto;
      }

      .error-icon {
        margin-bottom: 1.5rem;
        display: flex;
        justify-content: center;
      }

      .error-container h1 {
        font-size: 2rem;
        font-weight: 700;
        color: #ef4444;
        margin-bottom: 1rem;
      }

      .error-container > p {
        font-size: 1.1rem;
        color: #666;
        margin-bottom: 2rem;
      }

      .error-details {
        background: rgba(239, 68, 68, 0.1);
        padding: 1.5rem;
        border-radius: 12px;
        margin-bottom: 2rem;
        text-align: left;
      }

      .error-details p {
        margin: 0.5rem 0;
        color: #000;
        font-size: 0.9rem;
        font-family: monospace;
      }

      .error-details strong {
        color: #ef4444;
      }

      /* Payment Container */
      .payment-container {
        background: white;
        border-radius: 20px;
        padding: 2.5rem;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
      }

      .page-title {
        display: flex;
        align-items: center;
        gap: 1rem;
        font-size: 2rem;
        font-weight: 700;
        color: #000000;
        margin-bottom: 2rem;
      }

      /* Payment Grid */
      .payment-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
      }

      /* Cards */
      .booking-summary-card,
      .payment-methods-card {
        background: rgba(255, 255, 255, 0.95);
        border: 2px solid #e0e0e0;
        border-radius: 16px;
        padding: 2rem;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
      }

      .card-title {
        font-size: 1.5rem;
        font-weight: 700;
        color: #000000;
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 2px solid #f0f0f0;
      }

      /* Summary Sections */
      .summary-section {
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid #f0f0f0;
      }

      .summary-section:last-of-type {
        border-bottom: none;
      }

      .summary-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.9rem;
        font-weight: 600;
        color: #666;
        margin-bottom: 0.75rem;
      }

      .summary-details p {
        color: #000000;
        margin: 0.5rem 0;
      }

      .journey-info {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #000000;
        font-weight: 500;
        margin-top: 0.5rem;
      }

      .summary-value {
        color: #000000;
        font-size: 1rem;
        font-weight: 500;
        margin: 0.25rem 0;
      }

      .summary-value.pnr {
        font-size: 1.25rem;
        font-weight: 700;
        color: #f57c00;
        letter-spacing: 1px;
      }

      .summary-total {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 12px;
        margin-top: 1.5rem;
        font-size: 1.25rem;
        font-weight: 700;
        color: white;
      }

      .summary-total .amount {
        font-size: 1.75rem;
      }

      /* Payment Methods */
      .payment-methods {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-bottom: 2rem;
      }

      .payment-method {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1.25rem;
        border: 2px solid #e0e0e0;
        border-radius: 12px;
        background: white;
        cursor: pointer;
        transition: all 0.3s ease;
        position: relative;
      }

      .payment-method:hover:not(:disabled) {
        border-color: #667eea;
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.2);
      }

      .payment-method.selected {
        border-color: #667eea;
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
      }

      .payment-method:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .payment-method span {
        flex: 1;
        font-weight: 600;
        color: #000000;
      }

      .payment-method .check-icon {
        color: #667eea;
      }

      .payment-info {
        background: rgba(102, 126, 234, 0.1);
        padding: 1.25rem;
        border-radius: 12px;
        margin-bottom: 1.5rem;
      }

      .payment-info p {
        color: #000000;
        margin: 0.5rem 0;
        font-size: 0.9rem;
      }

      .btn-pay {
        width: 100%;
        padding: 1.25rem;
        font-size: 1.1rem;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.75rem;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
        border-radius: 12px;
        color: white;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .btn-pay:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
      }

      .btn-pay:disabled {
        opacity: 0.7;
        cursor: not-allowed;
        transform: none;
      }

      .spinner {
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }

      /* Payment Result */
      .payment-result {
        text-align: center;
        padding: 4rem 2rem;
        background: white;
        border-radius: 20px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
        max-width: 600px;
        margin: 0 auto;
      }

      .result-icon {
        margin-bottom: 1.5rem;
      }

      .success-result .result-icon {
        color: #10b981;
      }

      .failed-result .result-icon {
        color: #ef4444;
      }

      .payment-result h1 {
        font-size: 2rem;
        font-weight: 700;
        color: #000000;
        margin-bottom: 1rem;
      }

      .result-message {
        font-size: 1.1rem;
        color: #000000;
        margin-bottom: 1.5rem;
      }

      .result-details p {
        color: #666;
        margin: 0.5rem 0;
      }

      .result-actions {
        display: flex;
        gap: 1rem;
        justify-content: center;
        margin-top: 2rem;
      }

      /* Admin View */
      .no-access {
        text-align: center;
        padding: 4rem 2rem;
        background: white;
        border-radius: 20px;
        border: 1px solid #e0e0e0;
      }

      .no-access h2 {
        margin-top: 1rem;
        color: #000000;
      }

      .no-access p {
        color: #666;
        margin-top: 0.5rem;
      }

      /* Responsive Design */
      @media (max-width: 768px) {
        .payment-grid {
          grid-template-columns: 1fr;
        }

        .payment-container {
          padding: 1.5rem;
        }

        .page-title {
          font-size: 1.5rem;
        }

        .card-title {
          font-size: 1.25rem;
        }
      }

      /* Admin View Styles */
      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
        padding: 1.5rem;
        background: white;
        border-radius: 16px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
      }

      .page-subtitle {
        color: #666;
        margin-top: 0.25rem;
      }

      .filter-group {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .filter-group label {
        font-weight: 600;
        color: #000000;
      }

      .filter-group select {
        padding: 0.5rem 1rem;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        font-size: 0.95rem;
        background: white;
        color: #000000;
      }

      .payments-table-wrapper {
        background: white;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        margin-bottom: 2rem;
      }

      .payments-table {
        width: 100%;
        border-collapse: collapse;
      }

      .payments-table thead {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }

      .payments-table th {
        padding: 1rem;
        text-align: left;
        font-weight: 600;
        font-size: 0.9rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .payments-table td {
        padding: 1rem;
        border-bottom: 1px solid #f0f0f0;
        color: #000000;
      }

      .payments-table tbody tr:hover {
        background: rgba(102, 126, 234, 0.05);
      }

      .transaction-id {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        font-family: monospace;
        font-size: 0.9rem;
        color: #666;
      }

      .pnr-badge {
        background: #f57c00;
        color: white;
        padding: 0.25rem 0.75rem;
        border-radius: 6px;
        font-weight: 600;
        font-size: 0.9rem;
        letter-spacing: 1px;
      }

      .user-info {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      .user-info strong {
        color: #000000;
      }

      .user-info span {
        font-size: 0.85rem;
        color: #666;
      }

      .amount {
        font-weight: 700;
        font-size: 1.1rem;
        color: #10b981;
      }

      .method-badge {
        background: rgba(102, 126, 234, 0.1);
        color: #667eea;
        padding: 0.25rem 0.75rem;
        border-radius: 6px;
        font-weight: 600;
        font-size: 0.85rem;
        text-transform: uppercase;
      }

      .timestamp {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.9rem;
        color: #666;
      }

      .status-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        border-radius: 8px;
        font-weight: 600;
        font-size: 0.85rem;
        text-transform: uppercase;
      }

      .status-success {
        background: rgba(16, 185, 129, 0.1);
        color: #10b981;
      }

      .status-failed {
        background: rgba(239, 68, 68, 0.1);
        color: #ef4444;
      }

      .status-pending {
        background: rgba(245, 124, 0, 0.1);
        color: #f57c00;
      }

      .empty-state {
        text-align: center;
        padding: 4rem 2rem;
        background: white;
        border-radius: 16px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
      }

      .empty-state-icon {
        font-size: 4rem;
        margin-bottom: 1rem;
      }

      .empty-state-title {
        font-size: 1.5rem;
        font-weight: 600;
        color: #000000;
        margin-bottom: 0.5rem;
      }

      .empty-state p {
        color: #666;
      }

      .stats-summary {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1.5rem;
        margin-top: 2rem;
      }

      .stat-card {
        background: white;
        padding: 1.5rem;
        border-radius: 12px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        border-left: 4px solid #667eea;
      }

      .stat-card.success {
        border-left-color: #10b981;
      }

      .stat-card.danger {
        border-left-color: #ef4444;
      }

      .stat-label {
        display: block;
        font-size: 0.9rem;
        color: #666;
        margin-bottom: 0.5rem;
      }

      .stat-value {
        display: block;
        font-size: 2rem;
        font-weight: 700;
        color: #000000;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .animate-fadeIn {
        animation: fadeIn 0.3s ease;
      }
    `}</style>
  );

  useEffect(() => {
    console.log("🔵 Payments component loaded");
    console.log("📍 Location state:", location.state);
    console.log("📍 Booking from state:", booking);
    console.log("📍 Train details from state:", trainDetails);
    console.log("👤 User info:", user);
    console.log("🔑 Is Admin:", isAdmin);
    
    // Only fetch payments if this is admin view and no booking data
    if (isAdmin === true && !booking) {
      fetchPayments();
    } else {
      setIsLoading(false);
    }
  }, [isAdmin]);

  const fetchPayments = async () => {
    try {
      const response = await adminAPI.getAllPayments();
      setPayments(response.data);
    } catch (error) {
      console.error("Failed to fetch payments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!booking) {
      alert("No booking found. Please try again.");
      navigate("/trains");
      return;
    }

    console.log("🔵 Payment initiated for booking:", booking);
    console.log("🔵 Razorpay Key:", import.meta.env.VITE_RAZORPAY_KEY_ID);

    try {
      setIsProcessing(true);

      // Step 1: Create payment order
      console.log("📢 Creating payment order for booking ID:", booking.id);
      const orderResponse = await paymentAPI.createPaymentOrder(booking.id);
      const paymentOrder = orderResponse.data;
      
      console.log("✅ Payment order created:", paymentOrder);

      if (!paymentOrder.orderId) {
        throw new Error("Order ID not received from backend");
      }

      // Check if Razorpay key is set
      if (!import.meta.env.VITE_RAZORPAY_KEY_ID) {
        console.error("❌ VITE_RAZORPAY_KEY_ID is not set in environment variables");
        alert("Payment configuration error. Please contact support.");
        setIsProcessing(false);
        return;
      }

      // Step 2: Load Razorpay script
      console.log("📦 Loading Razorpay script...");
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      
      script.onload = () => {
        console.log("✅ Razorpay script loaded successfully");
        
        // Step 3: Open Razorpay payment modal
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: paymentOrder.amount, // amount in paise
          currency: "INR",
          order_id: paymentOrder.orderId,
          name: "Rail IRCTC",
          description: `Booking for ${trainDetails?.trainNumber} - ${booking.seatCount} seat(s)`,
          
          handler: async (response) => {
            try {
              console.log("✅ Payment successful from Razorpay:", response);
              
              // Step 4: Verify payment
              const verifyData = {
                bookingId: booking.id,
                orderId: paymentOrder.orderId,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              };

              console.log("📢 Verifying payment on backend...", verifyData);
              const verifyResponse = await paymentAPI.verifyPayment(verifyData);
              
              console.log("✅ Payment verified:", verifyResponse);
              
              if (verifyResponse.data.status === "SUCCESS" || verifyResponse.status === 200) {
                setPaymentStatus("success");
                console.log("✅ Payment status set to SUCCESS");
                setTimeout(() => {
                  navigate("/my-bookings", { 
                    state: { 
                      paymentSuccess: true,
                      pnr: booking.pnr 
                    } 
                  });
                }, 3000);
              } else {
                throw new Error("Payment verification failed");
              }
            } catch (error) {
              console.error("❌ Payment verification error:", error);
              setPaymentStatus("failed");
              setIsProcessing(false);
            }
          },

          prefill: {
            name: user?.name || "",
            email: user?.email || "",
          },

          theme: {
            color: "#667eea",
          },

          modal: {
            ondismiss: () => {
              console.log("⚠️ Payment modal closed by user");
              setIsProcessing(false);
            },
          },
        };

        console.log("🎯 Razorpay options:", options);
        const razorpay = new window.Razorpay(options);
        console.log("🎯 Opening Razorpay modal...");
        razorpay.open();
      };

      script.onerror = () => {
        console.error("❌ Failed to load Razorpay script");
        alert("Failed to load payment gateway. Please try again.");
        setIsProcessing(false);
      };

      document.body.appendChild(script);

    } catch (error) {
      console.error("❌ Payment initiation failed:", error);
      alert(`Payment error: ${error.message}`);
      setPaymentStatus("failed");
      setIsProcessing(false);
    }
  };

  const calculateTotal = () => {
    if (!booking) return 0;
    return booking.totalAmount || booking.seatCount * 500; // Fallback calculation
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "success":
      case "completed":
        return <CheckCircle size={18} />;
      case "failed":
        return <XCircle size={18} />;
      default:
        return <Clock size={18} />;
    }
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "success":
      case "completed":
        return "status-success";
      case "failed":
        return "status-failed";
      default:
        return "status-pending";
    }
  };

  const filteredPayments = payments.filter((payment) => {
    if (filter === "all") return true;
    return payment.paymentStatus?.toLowerCase() === filter;
  });

  if (isLoading) {
    return <Loader fullScreen text="Loading..." />;
  }

  // ❌ ERROR: No Booking Data for User Payment
  if (!isAdmin && !booking) {
    return (
      <div className="payments-page">
        <div className="container">
          <div className="error-container">
            <div className="error-icon">
              <AlertCircle size={64} />
            </div>
            <h1>❌ Booking Not Found</h1>
            <p>Unable to load booking details. Please go back and try again.</p>
            <div className="error-details">
              <p><strong>Debug Info:</strong></p>
              <p>Booking: {booking ? "✅ Loaded" : "❌ Missing"}</p>
              <p>Location: {location.state ? "✅ Present" : "❌ Missing"}</p>
              <p>User: {user?.email || "❌ Not logged in"}</p>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => navigate("/my-bookings")}
            >
              Back to My Bookings
            </button>
          </div>
        </div>
        {renderStyles()}
      </div>
    );
  }

  // Payment Success Screen
  if (paymentStatus === "success") {
    return (
      <div className="payments-page">
        <div className="container">
          <div className="payment-result success-result">
            <div className="result-icon">
              <CheckCircle size={80} />
            </div>
            <h1>Payment Successful!</h1>
            <p className="result-message">
              Your booking has been confirmed. PNR: <strong>{booking?.pnr}</strong>
            </p>
            <div className="result-details">
              <p>A confirmation email has been sent to {user?.email}</p>
              <p>Redirecting to My Bookings...</p>
            </div>
          </div>
        </div>
        {renderStyles()}
      </div>
    );
  }

  // Payment Failed Screen
  if (paymentStatus === "failed") {
    return (
      <div className="payments-page">
        <div className="container">
          <div className="payment-result failed-result">
            <div className="result-icon">
              <XCircle size={80} />
            </div>
            <h1>Payment Failed</h1>
            <p className="result-message">
              Your payment could not be processed. Please try again.
            </p>
            <div className="result-actions">
              <button 
                className="btn btn-primary"
                onClick={() => setPaymentStatus(null)}
              >
                Try Again
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => navigate("/my-bookings")}
              >
                Go to My Bookings
              </button>
            </div>
          </div>
        </div>
        {renderStyles()}
      </div>
    );
  }

  // User Payment Screen
  if (booking && !isAdmin) {
    return (
      <div className="payments-page">
        <div className="container">
          <div className="payment-container">
            <h1 className="page-title">
              <CreditCard size={32} />
              Complete Your Payment
            </h1>

            <div className="payment-grid">
              {/* Booking Summary */}
              <div className="booking-summary-card">
                <h2 className="card-title">Booking Summary</h2>
                
                <div className="summary-section">
                  <div className="summary-header">
                    <Train size={20} />
                    <span>Train Details</span>
                  </div>
                  <div className="summary-details">
                    <p><strong>{trainDetails?.trainNumber} - {trainDetails?.trainName}</strong></p>
                    <div className="journey-info">
                      <span>{location.state?.source}</span>
                      <ArrowRight size={16} />
                      <span>{location.state?.destination}</span>
                    </div>
                  </div>
                </div>

                <div className="summary-section">
                  <div className="summary-header">
                    <Calendar size={20} />
                    <span>Journey Date</span>
                  </div>
                  <p className="summary-value">{location.state?.date}</p>
                </div>

                <div className="summary-section">
                  <div className="summary-header">
                    <Hash size={20} />
                    <span>PNR Number</span>
                  </div>
                  <p className="summary-value pnr">{booking.pnr}</p>
                </div>

                <div className="summary-section">
                  <div className="summary-header">
                    <Users size={20} />
                    <span>Passengers</span>
                  </div>
                  <p className="summary-value">{booking.seatCount} Passenger(s)</p>
                  <p className="summary-value">Class: {booking.classType}</p>
                </div>

                <div className="summary-total">
                  <span>Total Amount</span>
                  <span className="amount">₹{calculateTotal()}</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="payment-methods-card">
                <h2 className="card-title">Select Payment Method</h2>
                
                <div className="payment-methods">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      className={`payment-method ${
                        selectedPaymentMethod === method.id ? "selected" : ""
                      }`}
                      onClick={() => setSelectedPaymentMethod(method.id)}
                      disabled={isProcessing}
                    >
                      <method.icon size={24} />
                      <span>{method.name}</span>
                      {selectedPaymentMethod === method.id && (
                        <CheckCircle size={20} className="check-icon" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="payment-info">
                  <p>🔒 Your payment is secure and encrypted</p>
                  <p>💳 We accept all major cards and payment methods</p>
                </div>

                <button
                  className="btn btn-primary btn-pay"
                  onClick={handlePayment}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Clock size={20} className="spinner" />
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <CreditCard size={20} />
                      Pay ₹{calculateTotal()}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
        {renderStyles()}
      </div>
    );
  }

  // Admin view (existing code)
  if (!isAdmin) {
    return (
      <div className="payments-page">
        <div className="container">
          <div className="no-access">
            <CreditCard size={64} />
            <h2>Payment History</h2>
            <p>
              Your payment history will appear here after you make a booking
              payment.
            </p>
          </div>
        </div>
        {renderStyles()}
      </div>
    );
  }

  // Admin Payments View
  return (
    <div 
      className="payments-page"
      style={{
        backgroundImage: `url(${authBgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        minHeight: '100vh'
      }}
    >
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title">
              <CreditCard size={28} />
              All Payments
            </h1>
            <p className="page-subtitle">View all payment transactions</p>
          </div>

          <div className="filter-group">
            <label>Filter:</label>
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All Payments</option>
              <option value="success">Successful</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        {filteredPayments.length ? (
          <div className="payments-table-wrapper">
            <table className="payments-table">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>PNR</th>
                  <th>User</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="animate-fadeIn">
                    <td>
                      <span className="transaction-id">
                        <Hash size={14} />
                        {payment.transactionId}
                      </span>
                    </td>
                    <td>
                      <span className="pnr-badge">
                        {payment.booking.pnr}
                      </span>
                    </td>
                    <td>
                      <div className="user-info">
                        <strong>{payment.booking.user.name}</strong>
                        <span>{payment.booking.user.email}</span>
                      </div>
                    </td>
                    <td>
                      <span className="amount">
                        ₹{payment.amount.toLocaleString()}
                      </span>
                    </td>
                    <td>
                      <span className="method-badge">
                        {payment.paymentMethod}
                      </span>
                    </td>
                    <td>
                      <div className="timestamp">
                        <Calendar size={14} />
                        {new Date(
                          payment.paymentTimestamp
                        ).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`status-badge ${getStatusClass(
                          payment.paymentStatus
                        )}`}
                      >
                        {getStatusIcon(payment.paymentStatus)}
                        {payment.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">💳</div>
            <h3 className="empty-state-title">No payments found</h3>
            <p>Payment transactions will appear here</p>
          </div>
        )}

        {/* Stats */}
        <div className="stats-summary">
          <div className="stat-card">
            <span className="stat-label">Total Transactions</span>
            <span className="stat-value">{payments.length}</span>
          </div>
          <div className="stat-card success">
            <span className="stat-label">Successful</span>
            <span className="stat-value">
              {
                payments.filter(
                  (p) => p.paymentStatus?.toLowerCase() === "success"
                ).length
              }
            </span>
          </div>
          <div className="stat-card danger">
            <span className="stat-label">Failed</span>
            <span className="stat-value">
              {
                payments.filter(
                  (p) => p.paymentStatus?.toLowerCase() === "failed"
                ).length
              }
            </span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Total Amount</span>
            <span className="stat-value">
              ₹
              {payments
                .reduce((sum, p) => sum + (p.amount || 0), 0)
                .toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
