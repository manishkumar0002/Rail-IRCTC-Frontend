# Payment Flow - Sequence Diagram

```
┌─────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│   Frontend      │         │   Backend API    │         │   Razorpay       │
│   React App     │         │  Spring Boot     │         │   Gateway        │
└────────┬────────┘         └────────┬─────────┘         └────────┬─────────┘
         │                           │                            │
         │                           │                            │
         │   1. User fills form      │                            │
         ├──────────────────────────>│                            │
         │   POST /bookings          │                            │
         │   {trainId, seatCount}    │                            │
         │                           │                            │
         │                           │  Validate route            │
         │                           │  Check seats               │
         │                           │  Save booking              │
         │                           │                            │
         │   2. Return booking       │                            │
         │<──────────────────────────┤                            │
         │   {bookingId, status:     │                            │
         │    PAYMENT_PENDING}       │                            │
         │                           │                            │
         │   3. User navigates to    │                            │
         │      Payment page         │                            │
         │      (Booking Summary)    │                            │
         │                           │                            │
         │   4. Click "Pay Now"      │                            │
         ├──────────────────────────────────────────────────────>│
         │   POST /api/payments/     │                            │
         │   create-order/{bookingId}│ (Path parameter)          │
         │                           │                            │
         │                           │  Generate order            │
         │                           │  Set amount                │
         │                           │  Save order info           │
         │                           │                            │
         │   5. Return order data    │                            │
         │   PaymentOrderResponse    │                            │
         │<──────────────────────────┤                            │
         │   {orderId, key,          │                            │
         │    amount, bookingId}     │                            │
         │                           │                            │
         │   6. Open Razorpay        │                            │
         │      Checkout Modal       ├───────────────────────────>│
         │      with orderId         │   Check order validity     │
         │      + key + amount       │                            │
         │                           │                            │
         │   7. User enters card     │                            │
         │      details/UPI/NetBank  │                            │
         │                           │    Process payment         │
         │                           │    Generate signature      │
         │                           │                            │
         │   8. Payment processed    │                            │
         │<───────────────────────────────────────────────────────┤
         │   {razorpay_payment_id,   │                            │
         │    razorpay_order_id,     │                            │
         │    razorpay_signature}    │                            │
         │                           │                            │
         │   9. Send verification    │                            │
         ├──────────────────────────────────────────────────────>│
         │   POST /api/payments/     │                            │
         │   verify                  │                            │
         │   PaymentVerifyRequest    │                            │
         │   {bookingId,             │                            │
         │    razorpayOrderId,       │                            │
         │    razorpayPaymentId,     │                            │
         │    razorpaySignature}     │                            │
         │                           │                            │
         │                           │  Verify signature          │
         │                           │  Match amount              │
         │                           │  Check order exists        │
         │                           │  Update booking →          │
         │                           │  CONFIRMED                 │
         │                           │  Save payment record       │
         │                           │  Send confirmation email   │
         │                           │                            │
         │   10. Return success      │                            │
         │   "Payment verified &     │                            │
         │    booking confirmed"     │                            │
         │<──────────────────────────┤                            │
         │                           │                            │
         │   11. Show success page   │                            │
         │       "Payment OK!"       │                            │
         │                           │                            │
         │   12. Redirect to         │                            │
         │       My Bookings         │                            │
         │       (auto, 3 seconds)   │                            │
         │                           │                            │
         │   13. Fetch bookings      │                            │
         ├──────────────────────────>│                            │
         │   GET /bookings/          │                            │
         │   my-bookings             │                            │
         │                           │                            │
         │   14. Return bookings     │                            │
         │<──────────────────────────┤                            │
         │   [{bookingId, status:    │                            │
         │    CONFIRMED, ...}]       │                            │
         │                           │                            │
         │   15. Display booking     │                            │
         │       with CONFIRMED      │                            │
         │       status              │                            │
         │                           │                            │
```

---

## ALTERNATE FLOW - PAYMENT FAILED

```
┌─────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│   Frontend      │         │   Backend API    │         │   Razorpay       │
│   React App     │         │  Spring Boot     │         │   Gateway        │
└────────┬────────┘         └────────┬─────────┘         └────────┬─────────┘
         │                           │                            │
         │   User clicks "Pay Now"   │                            │
         ├──────────────────────────>│                            │
         │   POST /payments/create   │                            │
         │                           │                            │
         │   Return orderId          │                            │
         │<──────────────────────────┤                            │
         │                           │                            │
         │   Open Razorpay Checkout  │                            │
         │                           ├───────────────────────────>│
         │                           │                            │
         │   User closes payment     │                            │
         │   OR cancels              │                            │
         │<───────────────────────────────────────────────────────┤
         │   Payment cancelled       │                            │
         │                           │                            │
         │   OPTION A: User retries  │                            │
         │   "Pay Now" again         │ (Repeat flow)              │
         │                           │                            │
         │   OPTION B: User leaves   │                            │
         │   Booking stays PENDING   │                            │
         │                           │                            │
         │   [Backend Job]           │                            │
         │   After 15 minutes:       │                            │
         │   Auto-cancel booking +   │                            │
         │   Release seats           │                            │
         │                           │                            │
```

---

## ERROR SCENARIOS

### Scenario 1: Invalid Signature

```
Frontend sends verification
        ↓
Backend verifies signature
        ↓
Signature mismatch ❌
        ↓
Backend: Payment FAILED
         Booking status → CANCELLED
         Seats released
        ↓
Frontend: Show error
          "Payment verification failed"
```

### Scenario 2: Booking Timeout

```
User creates booking
        ↓
15 minutes pass without payment
        ↓
Backend job runs
        ↓
Checks PAYMENT_PENDING bookings
        ↓
Auto-cancel + release seats
        ↓
Next time user logs in:
Booking shows CANCELLED status
```

### Scenario 3: Network Error

```
Frontend sends verification
        ↓
Network times out
        ↓
Frontend retries (up to 3 times)
        ↓
If still fails:
Show error "Please check connection"
        ↓
User can retry payment later
```

---

## 📱 MOBILE FLOW (Same logic, simplified UI)

```
1. Search trains (same)
2. Select train (same)
3. Enter passenger details (same)
4. Confirm booking → PAYMENT_PENDING (same)
5. Click "Pay" button
   ↓
   Opens Razorpay modal (full screen)
   ↓
6. User enters payment details
7. Confirms payment
   ↓
8. Razorpay returns to app
9. Frontend verifies payment
10. Show success "Booking Confirmed!"
11. Auto-dismiss → My Bookings page
```

---

## 🔐 SECURITY FLOW

```
1. Frontend sends verification request
   ↓
2. Backend receives it (JWT validated)
   ↓
3. Backend queries Razorpay API
   ↓
   Verify signature = SHA256(orderId + "|" + paymentId + RAZORPAY_SECRET)
   ↓
4. If signature valid ✅
   - Update booking → CONFIRMED
   - Save payment record
   - Release temp seat hold
   - Send email confirmation
   ↓
5. If signature invalid ❌
   - Auto-cancel booking
   - Release seats
   - Log security alert
   - Return 400 error
```

---

## 💾 DATABASE UPDATES

### Booking Table
```
BEFORE Payment:
status = PAYMENT_PENDING
tempSeatHold = true
tempHoldExpiry = now + 15 minutes

AFTER Payment Success:
status = CONFIRMED
tempSeatHold = false
confirmedAt = now
paidAmount = 1000

AFTER Payment Failure:
status = CANCELLED
tempSeatHold = false
cancelledAt = now
```

### Payment Table
```
INSERT INTO payments:
- bookingId = 101
- razorpayOrderId = "order_xyz"
- razorpayPaymentId = "pay_xyz"
- razorpaySignature = "sig_xyz"
- amount = 1000
- status = SUCCESS
- paymentMethod = "CARD"
- createdAt = now
```

---

## ✅ FINAL CHECKLIST (All Paths Covered)

- [x] Happy path: Payment succeeds
- [x] Error path: Payment fails → Retry
- [x] Error path: Signature invalid → Auto-cancel
- [x] Timeout path: User doesn't pay → Auto-cancel after 15 mins
- [x] Edge case: User closes modal → Can retry
- [x] Edge case: Network error → Retry logic
- [x] Mobile: Razorpay full screen
- [x] Security: Signature verification
- [x] Confirmation: Email sent
- [x] Tracking: Payment record saved

---

This covers ALL possible payment scenarios! 🎯
