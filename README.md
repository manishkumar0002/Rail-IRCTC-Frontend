


# IRCTC Railway Booking System - Frontend

A modern railway ticket booking application built with React, featuring real-time seat availability, secure authentication, and payment integration.

## Features

- [X] User Authentication (JWT + Google OAuth)
- [X] Train Search by source/destination/date
- [X] Real-time Seat Availability
- [X] Complete Booking Flow
- [X] Payment Integration
- [X] My Bookings Management
- [X] Secure Logout
- [X] Modern UI with 3D Effects

## Tech Stack

- React 18 + Vite
- TailwindCSS + shadcn/ui
- React Router v6
- Axios
- Lucide React Icons

## Installation

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/Rail-IRCTC-FRONTEND.git
cd Rail-IRCTC-FRONTEND

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Backend Integration

Update API base URL in `src/services/api.js`:
```javascript
const API_BASE_URL = "http://localhost:8080";
```

## Author

**Manish Kumar**

## License

MIT License