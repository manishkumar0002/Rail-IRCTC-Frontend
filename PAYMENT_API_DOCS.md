# IRCTC Payment APIs - Complete Documentation

> **Base URL**: `http://localhost:8080/api`

---

## 1 CREATE BOOKING (Before Payment)

### POST `/bookings`

Create a new booking with status `PAYMENT_PENDING`

**Headers**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body**
```json
{
  "trainId": 1,
  "travelDate": "2026-02-01",
  "classType": "SL",
  "seatCount": 2,
  "sourceStationCode": "PNBE",
  "destinationStationCode": "MKA",
  "passengers": [
    {
      "name": "John Doe",
      "age": 30,
      "gender": "Male"
    },
    {
      "name": "Jane Doe",
      "age": 28,
      "gender": "Female"
    }
  ]
}
```

**Success Response (201)**
```json
{
  "bookingId": 101,
  "pnr": "IRCTC9F2A1",
  "status": "PAYMENT_PENDING",
  "amount": 1000,
  "trainNumber": "12345",
  "trainName": "Rajdhani Express",
  "travelDate": "2026-02-01",
  "seatCount": 2,
  "classType": "SL"
}
```

**Error Response (400)**
```json
{
  "error": "Destination station not in train route",
  "status": 400
}
```

---

## 2 CREATE RAZORPAY ORDER

### POST `/api/payments/create-order/{bookingId}`

Create a Razorpay order before opening checkout

**Headers**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Path Parameters**
```
bookingId: 101
```

**Success Response (200) - PaymentOrderResponse**
```json
{
  "orderId": "order_Nz7Yxyz123",
  "amount": 100000,
  "currency": "INR",
  "key": "rzp_test_S72Pr5BE7sCRzj",
  "bookingId": 101
}
```

⚠️ **Frontend MUST use this `key` + `orderId` in Razorpay Checkout**

---

## 3 VERIFY PAYMENT

### POST `/payments/verify`

Verify Razorpay payment & confirm booking

**Headers**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body**
```json
{
  "bookingId": 101,
  "razorpayOrderId": "order_Nz7Yxyz123",
  "razorpayPaymentId": "pay_Nz8abc456",
  "razorpaySignature": "9ef4dffbfd84f1318f6739a3ce19f9d85851857ae648f114332d8401e0949a3d",
  "paymentMethod": "UPI"
}
```

**Success Response (200)**
```json
{
  "message": "Payment verified successfully",
  "status": "CONFIRMED",
  "bookingId": 101,
  "pnr": "IRCTC9F2A1",
  "transactionId": "TXN20260123001"
}
```

**Failure Response (400)**
```json
{
  "error": "Invalid payment signature",
  "status": "FAILED"
}
```

➡️ **Backend will auto-cancel booking if not verified within 15 minutes**

---

## 4 GET BOOKING STATUS

### GET `/bookings/{bookingId}`

Fetch booking details

**Headers**
```
Authorization: Bearer <JWT_TOKEN>
```

**Success Response (200)**
```json
{
  "bookingId": 101,
  "pnr": "IRCTC9F2A1",
  "status": "CONFIRMED",
  "trainNumber": "12345",
  "trainName": "Rajdhani Express",
  "sourceStationCode": "PNBE",
  "destinationStationCode": "MKA",
  "travelDate": "2026-02-01",
  "seatCount": 2,
  "classType": "SL",
  "amount": 1000,
  "createdAt": "2026-01-23T10:30:00Z",
  "confirmedAt": "2026-01-23T10:35:00Z"
}
```

---

## 5️⃣ CANCEL BOOKING

### DELETE `/bookings/cancellations/{bookingId}`

Cancel a confirmed booking

**Headers**
```
Authorization: Bearer <JWT_TOKEN>
```

**Success Response (200)**
```json
{
  "message": "Booking cancelled successfully",
  "bookingId": 101,
  "status": "CANCELLED",
  "refundStatus": "INITIATED"
}
```

---

## 7️⃣ GET MY BOOKINGS

### GET `/api/bookings/my-bookings`

Fetch all bookings of logged-in user

**Headers**
```
Authorization: Bearer <JWT_TOKEN>
```

**Success Response (200)**
```json
[
  {
    "bookingId": 101,
    "pnr": "IRCTC9F2A1",
    "status": "CONFIRMED",
    "trainName": "Rajdhani Express",
    "travelDate": "2026-02-01",
    "seatCount": 2,
    "classType": "SL"
  },
  {
    "bookingId": 102,
    "pnr": "IRCTC9F2A2",
    "status": "PAYMENT_PENDING",
    "trainName": "Shatabdi Express",
    "travelDate": "2026-02-05",
    "seatCount": 1,
    "classType": "AC"
  }
]
```

---

## 🔄 COMPLETE PAYMENT FLOW

```
1. User searches for trains
2. Selects train & fills passenger details
3. Clicks "Confirm Booking"
   ↓
   POST /bookings → Get bookingId, pnr, status=PAYMENT_PENDING
   
4. Frontend redirects to /payment page
5. Displays booking summary
6. User selects payment method
7. Clicks "Pay Now"
   ↓
   POST /payments/create-order → Get orderId, key
   
8. Open Razorpay Checkout Modal
9. User completes payment
   ↓
   Razorpay returns: paymentId, signature
   
10. Frontend calls:
    POST /payments/verify
       ↓
       Backend verifies signature
       ↓
       Updates booking → CONFIRMED
       ↓
       Sends confirmation email
    
11. Show success screen
12. Auto-redirect to My Bookings
    ↓
    GET /bookings/my-bookings → Show CONFIRMED booking
```

---

## ⚠️ ERROR HANDLING

| Code | Scenario | Response |
|------|----------|----------|
| 400 | Invalid station | `"Destination station not in train route"` |
| 401 | No/Invalid token | `"Unauthorized"` |
| 403 | Insufficient seats | `"Not enough seats available"` |
| 404 | Booking not found | `"Booking not found"` |
| 409 | Signature mismatch | `"Invalid payment signature"` |
| 500 | Server error | `"Internal server error"` |

---

## 🔐 SECURITY

✅ All endpoints require JWT token  
✅ Razorpay signature verification mandatory  
✅ Auto-cancel stale PAYMENT_PENDING bookings  
✅ XSS & CSRF protection enabled  

---

## 📝 FRONTEND IMPLEMENTATION CHECKLIST

- [ ] Add Razorpay script to `index.html`
- [ ] Create payment service with Razorpay integration
- [ ] Implement booking → order → payment flow
- [ ] Handle payment success/failure
- [ ] Show booking confirmation
- [ ] Display My Bookings list
- [ ] Implement cancel booking feature
- [ ] Add error toast notifications
- [ ] Test with test credentials

---

## 🧪 POSTMAN COLLECTION

See `IRCTC-Payment-APIs.postman_collection.json` for ready-to-import collection

---

## 💬 Support

For issues, check backend logs or contact the backend team
