


# IRCTC Railway Booking System – Frontend

A modern, production-ready IRCTC railway booking experience with rich 3D UI, responsive layouts, secure auth, and full booking + payments flow.

## 🔗 Live Demo
- Home: https://rail-irctc-frontend.vercel.app/home

## ✨ Features
- Secure authentication (JWT + Google OAuth)
- Train search by source/destination/date with real-time seat availability
- Complete booking and payment flow with Razorpay integration
- My Bookings management (view, cancel, pay pending)
- Admin tools (trains, stations, routes, seats, payments)
- Modern 3D/Glass UI, animations, and fully responsive design

## 🛠 Tech Stack
- React 18 + Vite, React Router v6
- Tailwind CSS + shadcn/ui components
- Axios for API calls, Lucide icons
- React Hook Form + Zod validation, React Query

## 🚀 Quick Start
```bash
# Clone
git clone #
cd Rail-IRCTC-Frontend

# Install deps
npm install

# Run dev server
npm run dev

# Build production
npm run build
```

## ⚙️ Configuration
Set your backend URL in `src/services/api.js`:
```js
const API_BASE_URL = "http://localhost:8080"; // change to your backend
```

## 📜 Scripts
- `npm run dev` – start dev server
- `npm run build` – production build
- `npm run preview` – preview production build
- `npm run lint` – lint codebase
- `npm run test` / `npm run test:watch` – run vitest

## 🗂 Project Structure (key folders)
- src/pages – routes (Home, Login, Dashboard, Trains, MyBookings, Payments, Admin, Contact)
- src/components/home – home page sections (hero, features, routes, stats, CTA, footer)
- src/components/ui – shadcn/ui primitives
- src/services – API client
- src/context – Auth context

## 🎨 UI Highlights
- 3D cards, glassmorphism, hover lift, floating icons
- Image carousel hero with gradients and particles
- Responsive grids for routes, stats, and features
- Background theming for auth and protected pages

## 📄 License
MIT License