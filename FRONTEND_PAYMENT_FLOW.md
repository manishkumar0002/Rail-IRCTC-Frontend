# Frontend Payment Flow - Complete Implementation

## What's Been Implemented

### 1. **Updated Booking Flow** (`/src/pages/Trains.jsx`)
- Modified `handleBooking()` function to create a PENDING booking
- After booking creation, redirects to `/payment` page with booking details
- Passes train info, source, destination, and date to payment page

### 2. **Payment APIs** (`/src/services/api.js`)
Added new payment endpoints:
```javascript
export const paymentAPI = {
  // Create payment order (initiates payment)
  createPaymentOrder: (bookingId) =>
    api.post(`/api/payments/create-order`, { bookingId }),
  
  // Verify payment after gateway callback
  verifyPayment: (paymentData) =>
    api.post(`/api/payments/verify`, paymentData),
  
  // Get payment status
  getPaymentStatus: (bookingId) =>
    api.get(`/api/payments/status/${bookingId}`),
}
```

### 3. **Complete Payment Page** (`/src/pages/Payments.jsx`)
Created comprehensive payment interface with:

#### **User Payment Flow:**
- **Booking Summary Card**: Shows train details, PNR, journey date, passengers, class
- **Payment Methods**: Credit/Debit Card, UPI, Net Banking, Wallet
- **Payment Processing**: Simulates gateway integration
- **Payment Success Screen**: Shows confirmation with auto-redirect
- **Payment Failure Screen**: Shows error with retry option

#### **Features:**
- Clean, modern UI with gradient backgrounds
- Secure payment indicators
- Real-time payment status updates
- Mobile-responsive design
- Loading states during payment processing

### 4. **Router Configuration** (`/src/App.jsx`)
- Added `/payment` route for payment page
- Both `/payment` and `/payments` routes available

---

## Frontend Flow Diagram

```
User Books Ticket (Trains.jsx)
         |
         V
Fill passenger details + Select class
         |
         V
Click "Confirm Booking"
         |
         V
API: POST /api/bookings (creates PENDING booking)
         |
         V
Navigate to /payment page
         |
         V
Payment Page (Payments.jsx)
|- Shows booking summary
|- Select payment method
|- Click "Pay INR XXX"
         |
         V
API: POST /api/payments/create-order
         |
         V
[Payment Gateway Integration]
(Simulated in frontend for now)
         |
         V
API: POST /api/payments/verify
         |
         V
Success? ----YES----> Show success screen
    |                     |
    |            Auto-redirect to /my-bookings
    |
   
    |
    V
Show failure screen
    |
    V
Retry payment option
```

---

## 🔧 What YOU Need to Build (Backend)

### 1. **Create Payment Order Endpoint**
```java
POST /api/payments/create-order

Request Body:
{
  "bookingId": 123
}

Response:
{
  "orderId": "order_xxx",
  "amount": 1500,
  "currency": "INR",
  "bookingId": 123
}
```

**Backend Logic:**
- Validate booking exists and is PENDING
- Calculate total amount
- Create payment order in database
- Return order details

### 2. **Verify Payment Endpoint**
```java
POST /api/payments/verify

Request Body:
{
  "bookingId": 123,
  "orderId": "order_xxx",
  "paymentId": "pay_xxx",
  "signature": "sig_xxx",
  "amount": 1500,
  "paymentMethod": "card",
  "status": "SUCCESS"
}

Response:
{
  "status": "SUCCESS",
  "transactionId": "TXN123456",
  "bookingId": 123,
  "pnr": "ABC123"
}
```

**Backend Logic:**
- Verify payment signature (if using Razorpay/Stripe)
- Update booking status: PENDING → CONFIRMED
- Save payment details in payments table
- Generate transaction ID
- Send confirmation email
- Return success response

### 3. **Update Booking Entity**
Add status field:
```java
public enum BookingStatus {
    PENDING,      // Just created, awaiting payment
    CONFIRMED,    // Payment successful
    CANCELLED,    // User cancelled
    FAILED        // Payment failed
}
```

### 4. **Booking Creation Update**
When creating booking:
```java
POST /api/bookings

// Set initial status as PENDING
booking.setStatus(BookingStatus.PENDING);
booking.setTotalAmount(calculateAmount());
```

### 5. **Payment Entity/Table**
```java
@Entity
public class Payment {
    @Id
    private Long id;
    
    private String transactionId;
    private String orderId;
    private String paymentId;
    
    @ManyToOne
    private Booking booking;
    
   ivate Double amount;
    private String paymentMethod;
    private String paymentStatus; // SUCCESS, FAILED, PENDING
    
    private LocalDateTime paymentTimestamp;
    private String signature;
}
```

---

## 💳 Real Payment Gateway Integration (Optional)

### For Razorpay:
1. Add Razorpay dependency to `pom.xml`
2. Create Razorpay order in backend
3. Return order_id to frontend
4. Frontend opens Razorpay checkout modal
5. User completes payment
6. Razorpay callback to backend webhook
7. Verify signature and update booking

### Frontend would use:
```javascript
// Load Razorpay script
const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// Open Razorpay modal
const options = {
  key: 'YOUR_RAZORPAY_KEY',
  amount: amount * 100, // paise
  currency: 'INR',
  order_id: orderId,
  name: 'IRCTC Rail Booking',
  handler: function(response) {
    Verify payment
    verifyPayment(response);
  }
};

const razorpay = new window.Razorpay(options);
razorpay.open();
```

---

## 🧪 Testing the Flow

### 1. **Book a Ticket:**
- Go to Trains page
- Search for trains
- Click "Book Now"
- Fill passenger details
- Click "Confirm Booking"

### 2. **Payment Page:**
- Should see booking summary
- Select payment method
- Click "Pay ₹XXX"
- Wait 2 seconds (simulated payment)

###X3. **Success:**
- See success screen
- Auto-redirect to My Bookings
- Booking should show as CONFIRMED

---

## Backend Endpoints Checklist

Create these endpoints:

- [x] `POST /api/bookings` - Already exists (update to set PENDING status)
- [ ] `POST /api/payments/create-order` - Create payment order
- [ ] `POST /api/payments/verify` - Verify and confirm payment
- [ ] `GET /api/payments/status/:bookingId` - Get payment status (optional)
- [ ] `GET /api/admin/payments` - Admin: View all payments (already exists)

---

## Key Points

1. **Frontend handles**: UI/UX, payment method selection, status display
2. **Backend handles**: Payment verification, booking confirmation, security
3. **Current state**: Frontend is COMPLETE and READY
4. **You need to**: Build backend endpoints listed above
5. **Payment gateway**: Optional (can integrate Razorpay later)

---

## Quick Start for Backend

1. Update `Booking` entity with `status` and `totalAmount` fields
2. Create `Payment` entity/table
3. Create `PaymentController` with endpoints
4. Create `PaymentService` for business logic
5. Update `BookingService` to set initial status as PENDING
6. Test with frontend!

---

## Need Help?

If you need clarification on any endpoint or the flow, let me know!
