import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { bookingAPI } from "../services/api";
import {
  Train,
  Search,
  Ticket,
  CreditCard,
  Settings,
  HelpCircle,
  TrendingUp,
  MapPin,
  Clock,
  CheckCircle,
  FileText,
  User,
  ArrowRight
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip
} from "recharts";
import logger from "../utils/logger";

const chartData = [
  { name: "MAY", amount: 12 },
  { name: "JUN", amount: 18 },
  { name: "JUL", amount: 15 },
  { name: "AUG", amount: 28 },
  { name: "SEP", amount: 22 },
  { name: "OCT", amount: 38 }
];

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [upcomingBooking, setUpcomingBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const res = await bookingAPI.getMyBookings();
      if (res && res.data) {
        const list = Array.isArray(res.data) ? res.data : [];
        setBookings(list);
        
        // Find the next upcoming journey or most recent
        const sorted = [...list].sort(
          (a, b) => new Date(a.travelDate) - new Date(b.travelDate)
        );
        const upcoming = sorted.find(
          (b) => new Date(b.travelDate) >= new Date().setHours(0, 0, 0, 0)
        );
        setUpcomingBooking(upcoming || sorted[sorted.length - 1] || null);
      }
    } catch (err) {
      logger.error("Dashboard: failed to load bookings", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Mock fallbacks for visual presentation when data is empty
  const defaultUpcoming = {
    pnr: "4528-992-012",
    travelDate: "2024-10-24",
    travelTime: "06:00 AM",
    classType: "Executive Class",
    sourceStationCode: "NDLS",
    destinationStationCode: "BOM"
  };

  const currentUpcoming = upcomingBooking
    ? {
        pnr: upcomingBooking.pnr,
        travelDate: upcomingBooking.travelDate,
        travelTime: upcomingBooking.travelTime || "06:00 AM",
        classType: upcomingBooking.classType || "AC Chair Car",
        sourceStationCode: upcomingBooking.sourceStationCode,
        destinationStationCode: upcomingBooking.destinationStationCode
      }
    : defaultUpcoming;

  const mockRecentActivity = [
    {
      id: 1,
      type: "confirm",
      title: "Booking Confirmed",
      subtitle: upcomingBooking 
        ? `Trip to ${upcomingBooking.destinationStationCode} (PNR: ${upcomingBooking.pnr})`
        : "Trip to Bengaluru (PNR: 982301)",
      time: "2 HOURS AGO",
      color: "text-emerald-500 bg-emerald-50 border-emerald-100"
    },
    {
      id: 2,
      type: "refund",
      title: "Refund Processed",
      subtitle: "Ref ID: #TXN-9982 (₹4,250)",
      time: "5 HOURS AGO",
      color: "text-blue-500 bg-blue-50 border-blue-100"
    },
    {
      id: 3,
      type: "alert",
      title: "Platform Change",
      subtitle: "Train #12952 (New Delhi) shifted to PF 8",
      time: "YESTERDAY",
      color: "text-amber-500 bg-amber-50 border-amber-100"
    }
  ];

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-10 font-sans">
      
      {/* Top Welcome Title Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Welcome back, {user?.name || "Executive Administrator"}
          </h1>
          <p className="text-xs font-semibold text-slate-400 mt-0.5">
            Global logistics overview and active transport monitoring.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/trains")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-sm transition-all"
          >
            New Booking
          </button>
          <button
            onClick={() => window.print()}
            className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs py-2.5 px-4 rounded-xl shadow-sm transition-all"
          >
            Generate Report
          </button>
        </div>
      </div>

      {/* Main Grid Row (Map and Upcoming card) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Live Transit Network map */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col relative overflow-hidden">
          <div className="flex items-center justify-between border-b pb-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <h3 className="font-bold text-slate-800 text-sm">Live Transit Network</h3>
            </div>
            <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full uppercase tracking-wider">
              12 Active Journeys
            </span>
          </div>

          {/* SVG Map of Network */}
          <div className="flex-1 min-h-[300px] max-h-[380px] bg-slate-50 rounded-xl relative flex items-center justify-center border border-slate-100 overflow-hidden select-none">
            
            {/* Mock Map Outline representation */}
            <svg viewBox="0 0 800 450" className="w-full h-full opacity-30 absolute inset-0 pointer-events-none p-4">
              <path d="M 150 150 L 300 200 L 450 120 L 600 250 L 700 220" fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="6 4" />
              <path d="M 220 300 L 350 250 L 450 350 L 580 300 L 680 380" fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="6 4" />
              <path d="M 300 200 L 450 350" fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="6 4" />
              <circle cx="150" cy="150" r="6" fill="#cbd5e1" />
              <circle cx="300" cy="200" r="6" fill="#cbd5e1" />
              <circle cx="450" cy="120" r="6" fill="#cbd5e1" />
              <circle cx="600" cy="250" r="6" fill="#cbd5e1" />
              <circle cx="700" cy="220" r="6" fill="#cbd5e1" />
              <circle cx="220" cy="300" r="6" fill="#cbd5e1" />
              <circle cx="350" cy="250" r="6" fill="#cbd5e1" />
              <circle cx="450" cy="350" r="6" fill="#cbd5e1" />
              <circle cx="580" cy="300" r="6" fill="#cbd5e1" />
              <circle cx="680" cy="380" r="6" fill="#cbd5e1" />
            </svg>

            {/* Pulsing Active Train Dots */}
            <div className="absolute top-[35%] left-[28%] flex flex-col items-center">
              <span className="relative flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-blue-600"></span>
              </span>
            </div>

            <div className="absolute top-[48%] left-[55%] flex flex-col items-center">
              <span className="relative flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-orange-600"></span>
              </span>
            </div>

            {/* Map Popup Floating card */}
            <div className="absolute top-[15%] left-[5%] md:left-[8%] bg-white/95 backdrop-blur border border-slate-200/80 rounded-xl p-4 shadow-lg shadow-slate-100 max-w-xs z-10 font-sans">
              <div className="flex items-center gap-1.5 mb-2.5">
                <span className="w-2.5 h-2.5 bg-blue-600 rounded-full"></span>
                <span className="font-extrabold text-slate-800 text-xs tracking-tight">VANDE BHARAT #22436</span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] mb-3 text-slate-600">
                <span>Origin:</span>
                <span className="font-bold text-slate-800 text-right">New Delhi (NDLS)</span>
                <span>Destination:</span>
                <span className="font-bold text-slate-800 text-right">Varanasi (BSB)</span>
              </div>
              <div className="space-y-1.5 border-t pt-2.5">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                  <span>65% COMPLETED</span>
                  <span className="text-blue-700">14:20 ETA</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: "65%" }}></div>
                </div>
              </div>
            </div>
            
          </div>
        </div>

        {/* Right 1 Column: Upcoming Journey & Quick Actions */}
        <div className="space-y-6">
          
          {/* Upcoming Journey Gradient Card */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl p-6 shadow-md shadow-blue-600/10 flex flex-col relative overflow-hidden min-h-[190px]">
            {/* Decors */}
            <div className="absolute -right-8 -bottom-8 text-white/5 opacity-10 font-sans font-black text-9xl">
              🚂
            </div>
            
            <div className="flex justify-between items-start mb-4 border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-bold text-blue-200/80 uppercase tracking-widest">Upcoming Journey</span>
                <h4 className="font-extrabold text-sm mt-0.5 tracking-tight">
                  {currentUpcoming.travelDate}
                </h4>
              </div>
              <div className="bg-white/15 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase">
                {currentUpcoming.classType}
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-center">
              <div className="flex items-center justify-between mb-4">
                <div className="text-left">
                  <span className="block text-2xl font-black tracking-tight">{currentUpcoming.sourceStationCode}</span>
                  <span className="text-[10px] text-blue-200 font-bold uppercase tracking-wider">Origin</span>
                </div>
                <div className="flex-1 flex flex-col items-center px-4 relative">
                  <div className="w-full border-t border-dashed border-white/30 absolute top-1/2 -translate-y-1/2"></div>
                  <Train className="w-4 h-4 text-white z-10 bg-indigo-700 p-0.5 rounded-full" />
                </div>
                <div className="text-right">
                  <span className="block text-2xl font-black tracking-tight">{currentUpcoming.destinationStationCode}</span>
                  <span className="text-[10px] text-blue-200 font-bold uppercase tracking-wider">Destination</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-[10px] text-blue-100 font-semibold pt-1">
                <span>TIME: {currentUpcoming.travelTime}</span>
                <span className="font-bold bg-indigo-800/50 px-2 py-1 rounded">PNR: {currentUpcoming.pnr}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-4 border-b pb-2">Quick Actions</h4>
            <div className="grid grid-cols-2 gap-3.5">
              <button
                onClick={() => navigate("/trains")}
                className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200/50 rounded-xl transition-all group"
              >
                <Search className="w-5 h-5 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-700">Search Trains</span>
              </button>

              <button
                onClick={() => navigate("/my-bookings")}
                className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200/50 rounded-xl transition-all group"
              >
                <Ticket className="w-5 h-5 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-700">PNR Status</span>
              </button>

              <button
                onClick={() => {
                  if (bookings.length > 0) {
                    navigate("/my-bookings", { state: { searchPnr: bookings[0].pnr } });
                  } else {
                    alert("No tickets booked yet.");
                  }
                }}
                className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200/50 rounded-xl transition-all group"
              >
                <FileText className="w-5 h-5 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-700">Last Ticket</span>
              </button>

              <button
                onClick={() => navigate("/contact")}
                className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200/50 rounded-xl transition-all group"
              >
                <HelpCircle className="w-5 h-5 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-700">Help Desk</span>
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Analytics & Recent Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Travel Analytics Line Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col h-[320px]">
          <div className="flex items-center justify-between border-b pb-3 mb-4">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Travel Analytics</h4>
            <span className="text-[10px] font-bold text-slate-400">Monthly expenditure & frequency</span>
          </div>

          <div className="flex-1 w-full text-xs font-sans select-none">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}k`} />
                <ChartTooltip formatter={(value) => [`₹${value},000`, "Spent"]} contentStyle={{ background: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0" }} />
                <Line type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, stroke: "#ffffff", strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 1 Column: Recent Activity Logger */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col h-[320px]">
          <div className="flex items-center justify-between border-b pb-3 mb-4">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Recent Activity</h4>
            <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded tracking-wider">LIVE</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {mockRecentActivity.map((act) => (
              <div key={act.id} className="flex gap-3 text-xs leading-normal">
                <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 ${act.color}`}>
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800">{act.title}</span>
                    <span className="text-[9px] text-slate-400 font-extrabold">{act.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{act.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* KPI Cards Bottom Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Train className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Journeys</span>
            <span className="text-lg font-black text-slate-800 mt-0.5 leading-none">
              {bookings.length > 0 ? bookings.length : "128"}
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">On-Time Rate</span>
            <span className="text-lg font-black text-slate-800 mt-0.5 leading-none">94%</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <User className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Loyalty Tier</span>
            <span className="text-lg font-black text-slate-800 mt-0.5 leading-none">Elite</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Alert Status</span>
            <span className="text-lg font-black text-slate-800 mt-0.5 leading-none">None</span>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
