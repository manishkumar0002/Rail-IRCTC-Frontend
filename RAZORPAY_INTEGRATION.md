# 🎯 Razorpay Integration Guide - React

Complete production-ready Razorpay integration for IRCTC frontend

---

## 1 SETUP RAZORPAY

### Add to `index.html`

```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

### Install package (Optional)

```bash
npm install razorpay
```

---

## 2 CREATE PAYMENT SERVICE

### File: `src/services/paymentService.js`

```javascript
import { paymentAPI } from "./api";

import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

export const paymentService = {
  // Step 1: Create order
  async createOrder(bookingId) {
    try {
      // POST /api/payments/create-order/{bookingId}
      const response = await axios.post(
        `${API_BASE_URL}/payments/create-order/${bookingId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );
      // Returns PaymentOrderResponse
      return response.data;
    } catch (error) {
      console.error("Failed to create order:", error);
      throw error;
    }
  },

  // Step 2: Open Razorpay checkout
  openCheckout(orderData, onSuccess, onError) {
    const options = {
      key: orderData.key,
      order_id: orderData.orderId,
      amount: orderData.amount,
      currency: "INR",
      name: "IRCTC Railway Booking",
      description: `Booking ID: ${orderData.bookingId}`,
      image: "https://your-logo-url.png",
      
      handler: function (response) {
        // Payment successful
        onSuccess(response);
      },
      
      prefill: {
        name: localStorage.getItem("userName") || "",
        email: localStorage.getItem("userEmail") || "",
        contact: localStorage.getItem("userPhone") || "",
      },
      
      theme: {
        color: "#667eea",
      },
      
      modal: {
        ondismiss: function () {
          onError("Payment cancelled by user");
        },
      },
      
      retry: {
        enabled: true,
        max_count: 3,
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  },

  // Step 3: Verify payment
  async verifyPayment(paymentData) {
    try {
      // POST /api/payments/verify
      // paymentData should match PaymentVerifyRequest:
      // {
      //   bookingId: number,
      //   razorpayOrderId: string,
      //   razorpayPaymentId: string,
      //   razorpaySignature: string
      // }
      const response = await axios.post(
        `${API_BASE_URL}/payments/verify`,
        paymentData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );
      // Returns: "Payment verified & booking confirmed"
      return response.data;
    } catch (error) {
      console.error("Payment verification failed:", error);
      throw error;
    }
  },
};
```

---

## 3 UPDATE PAYMENT PAGE

### File: `src/pages/Payments.jsx`

```jsx
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { paymentService } from "../services/paymentService";
import { CreditCard, CheckCircle, XCircle } from "lucide-react";

export default function Payments() {
  const location = useLocation();
  const navigate = useNavigate();
  const { booking, train, source, destination, date } = location.state || {};

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);

  if (!booking) {
    return <div>No booking data. Please go back.</div>;
  }

  const handlePayment = async () => {
    try {
      setIsProcessing(true);

      // Step 1: Create order
      console.log("📦 Creating payment order...");
      const orderData = await paymentService.createOrder(booking.id);
      console.log("✅ Order created:", orderData);

      // Step 2: Open Razorpay
      paymentService.openCheckout(orderData, handlePaymentSuccess, handlePaymentError);
    } catch (error) {
      console.error("❌ Payment failed:", error);
      setPaymentStatus("failed");
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = async (razorpayResponse) => {
    try {
      console.log("💳 Verifying payment...");

      // Step 3: Verify payment
      const verifyData = {
        bookingId: booking.id,
        razorpayOrderId: razorpayResponse.razorpay_order_id,
        razorpayPaymentId: razorpayResponse.razorpay_payment_id,
        razorpaySignature: razorpayResponse.razorpay_signature,
      };

      const result = await paymentService.verifyPayment(verifyData);
      // Response: "Payment verified & booking confirmed"
      console.log("✅ Payment verified:", result);

      setPaymentStatus("success");

      // Auto-redirect after 3 seconds
      setTimeout(() => {
        navigate("/my-bookings", {
          state: { paymentSuccess: true, pnr: result.pnr },
        });
      }, 3000);
    } catch (error) {
      console.error("❌ Verification failed:", error);
      setPaymentStatus("failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentError = (message) => {
    console.error("❌ Payment error:", message);
    setPaymentStatus("failed");
    setIsProcessing(false);
  };

  // Success Screen
  if (paymentStatus === "success") {
    return (
      <div className="payment-success">
        <CheckCircle size={80} color="green" />
        <h1>Payment Successful! ✅</h1>
        <p>PNR: {booking.pnr}</p>
        <p>Redirecting to My Bookings...</p>
      </div>
    );
  }

  // Failure Screen
  if (paymentStatus === "failed") {
    return (
      <div className="payment-failed">
        <XCircle size={80} color="red" />
        <h1>Payment Failed ❌</h1>
        <button onClick={() => setPaymentStatus(null)}>Try Again</button>
        <button onClick={() => navigate("/my-bookings")}>Go to My Bookings</button>
      </div>
    );
  }

  // Payment Screen
  return (
    <div className="payment-page">
      <div className="payment-container">
        <h1>Complete Payment</h1>

        {/* Booking Summary */}
        <div className="booking-summary">
          <h2>{train?.trainName}</h2>
          <p>{source} → {destination}</p>
          <p>Date: {date}</p>
          <p>Passengers: {booking.seatCount}</p>
          <p>Class: {booking.classType}</p>
        </div>

        {/* Amount */}
        <div className="amount-section">
          <h3>Amount: ₹{booking.amount}</h3>
        </div>

        {/* Payment Button */}
        <button
          onClick={handlePayment}
          disabled={isProcessing}
          className="payment-button"
        >
          {isProcessing ? (
            "Processing..."
          ) : (
            <>
              <CreditCard size={20} />
              Pay ₹{booking.amount} with Razorpay
            </>
          )}
        </button>
      </div>
    </div>
  );
}
```

---

## 4️⃣ COMPLETE PAYMENT API SERVICE

### File: `src/services/api.js` (Update)

```javascript
export const paymentAPI = {
  // Create Razorpay order
  createPaymentOrder: (bookingId) =>
    api.post(`/payments/create-order`, { bookingId }),

  // Verify payment after Razorpay callback
  verifyPayment: (paymentData) =>
    api.post(`/payments/verify`, paymentData),

  // Get payment status
  getPaymentStatus: (bookingId) =>
    api.get(`/payments/status/${bookingId}`),

  // Get payment history
  getPaymentHistory: () =>
    api.get(`/payments/history`),
};
```

---

## 5️⃣ HANDLE ERRORS GRACEFULLY

### Error Scenarios

```javascript
const handlePaymentError = async (errorCode, errorDescription) => {
  switch (errorCode) {
    case "RAZORPAY_ERROR":
      console.error("Razorpay Error:", errorDescription);
      break;
    case "NETWORK_ERROR":
      console.error("Network error. Please check your connection.");
      break;
    case "SERVER_ERROR":
      console.error("Server error. Please try again later.");
      break;
    default:
      console.error("Payment failed:", errorDescription);
  }

  // Show user-friendly error
  showToast("Payment failed. Please try again.", "error");
  setPaymentStatus("failed");
};
```

---

## 6️⃣ TESTING

### Test Card Details

**Card Number**: `4111111111111111`  
**Expiry**: Any future date (e.g., `12/30`)  
**CVV**: Any 3 digits (e.g., `123`)  
**Name**: Any name  

### Test UPI

**UPI ID**: `success@razorpay` (will succeed)  
**UPI ID**: `fail@razorpay` (will fail)  

### Test NetBanking

**Bank**: HDFC Bank (for testing)

---

## 7️⃣ PRODUCTION CHECKLIST

- [ ] Use Razorpay production key
- [ ] Remove console.log statements
- [ ] Add error tracking (Sentry)
- [ ] Implement retry logic
- [ ] Add payment timeout handling
- [ ] Verify HTTPS everywhere
- [ ] Add PCI compliance checks
- [ ] Setup webhook for payment confirmations
- [ ] Test all payment methods
- [ ] Load test payment flow

---

## 🔗 USEFUL LINKS

- Razorpay Docs: https://razorpay.com/docs/
- React Integration: https://razorpay.com/docs/payments/payment-gateway/web-integration/
- Test Cards: https://razorpay.com/docs/payments/payment-gateway/test-cards/

---

## 💡 TIPS

1. **Store booking ID before payment** - Needed for verification
2. **Handle network timeouts** - Add retry logic
3. **Log everything** - For debugging payment issues
4. **Test multiple methods** - Card, UPI, NetBanking
5. **Monitor Razorpay webhook** - For order status updates

---

## 🆘 TROUBLESHOOTING

| Issue | Solution |
|-------|----------|
| Checkout not opening | Check Razorpay script loaded + key valid |
| Signature mismatch | Verify all parameters sent correctly |
| Order not found | Check bookingId exists + order created |
| Payment stuck | Check backend logs for verification call |
| CORS error | Add CORS headers to backend |

---

**Need help?** Check backend logs + Razorpay dashboard for payment details.
