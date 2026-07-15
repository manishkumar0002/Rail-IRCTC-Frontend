import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { trainAPI, bookingAPI } from "../services/api";
import {
  Train as TrainIcon,
  Search,
  MapPin,
  Calendar,
  Users,
  ChevronRight,
  Filter,
  Check,
  ArrowRight,
  Info
} from "lucide-react";
import Loader from "../components/Loader";
import TrainCard from "../components/TrainCard";
import ToastContainer from "../components/ToastContainer";
import useToast from "../hooks/useToast";
import logger from "../utils/logger";

const SEAT_PRICE_MAP = {
  SL: 560,
  _3A: 1445,
  _2A: 2845,
  _1A: 4820
};

export default function Trains() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toasts, success, error, removeToast } = useToast();

  const [stations, setStations] = useState([]);
  const [allTrains, setAllTrains] = useState([]);
  const [filteredTrains, setFilteredTrains] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Steps flow state
  // 1 = Search, 2 = Selection, 3 = Passenger & Seats, 4 = Payment
  const [currentStep, setCurrentStep] = useState(2);

  // Filter States
  const [quota, setQuota] = useState("General"); // General or Tatkal
  const [departureTimes, setDepartureTimes] = useState({
    earlyMorning: false, // 00-06
    morning: true,       // 06-12
    afternoon: false,    // 12-18
    night: false         // 18-24
  });
  const [selectedClassesFilter, setSelectedClassesFilter] = useState({
    "1A": false,
    "2A": false,
    "3A": false,
    "3E": false,
    "SL": false
  });
  const [selectedTrainTypes, setSelectedTrainTypes] = useState({
    rajdhani: true,
    shatabdi: true,
    duronto: false,
    superfast: false
  });

  const [searchForm, setSearchForm] = useState({
    source: location.state?.source || "",
    destination: location.state?.destination || "",
    date: location.state?.date || new Date().toISOString().split("T")[0]
  });

  // Seat / Passenger selection state
  const [selectedTrain, setSelectedTrain] = useState(null);
  const [selectedClass, setSelectedClass] = useState("SL");
  const [selectedCoach, setSelectedCoach] = useState("B1");
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [passengers, setPassengers] = useState([]);
  const [isBooking, setIsBooking] = useState(false);

  // Coach lists
  const coaches = {
    B1: { left: 42, status: "Available" },
    B2: { left: 12, status: "Available" },
    B3: { left: 0, status: "Full" },
    B4: { left: 8, status: "Available" },
    B5: { left: 34, status: "Available" }
  };

  // 24 seats in coach layout representing 3-tier sleeper
  const seatsLayout = [
    { id: 1, type: "LB", status: "available" },
    { id: 2, type: "MB", status: "available" },
    { id: 3, type: "UB", status: "available" },
    { id: 4, type: "LB", status: "available" },
    { id: 5, type: "MB", status: "available" },
    { id: 6, type: "UB", status: "available" },
    { id: 7, type: "SL", status: "available" },
    { id: 8, type: "SU", status: "occupied" },
    
    { id: 9, type: "LB", status: "senior-female" },
    { id: 10, type: "MB", status: "available" },
    { id: 11, type: "UB", status: "available" },
    { id: 12, type: "LB", status: "available" },
    { id: 13, type: "MB", status: "available" },
    { id: 14, type: "UB", status: "available" },
    { id: 15, type: "SL", status: "rac" },
    { id: 16, type: "SU", status: "available" },

    { id: 17, type: "LB", status: "available" },
    { id: 18, type: "MB", status: "occupied" },
    { id: 19, type: "UB", status: "available" },
    { id: 20, type: "LB", status: "available" },
    { id: 21, type: "MB", status: "available" },
    { id: 22, type: "UB", status: "available" },
    { id: 23, type: "SL", status: "available" },
    { id: 24, type: "SU", status: "available" }
  ];

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [allTrains, quota, departureTimes, selectedClassesFilter, selectedTrainTypes]);

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      const [stationsRes, trainsRes] = await Promise.all([
        trainAPI.getStations(),
        trainAPI.getAllTrains()
      ]);
      setStations(stationsRes.data || []);
      setAllTrains(trainsRes.data || []);
      setFilteredTrains(trainsRes.data || []);
      if (searchForm.source && searchForm.destination) {
        setHasSearched(true);
        // filter immediately if redirected from search
        const filtered = (trainsRes.data || []).filter(
          t => t.sourceStationCode === searchForm.source && t.destinationStationCode === searchForm.destination
        );
        setFilteredTrains(filtered);
      }
    } catch (err) {
      error("Failed to load initial train data");
      setStations([]);
      setAllTrains([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchForm.source || !searchForm.destination) {
      error("Please pick source & destination");
      return;
    }

    try {
      setIsSearching(true);
      const res = await trainAPI.searchTrains(searchForm.source, searchForm.destination);
      setAllTrains(res.data || []);
      setHasSearched(true);
      setCurrentStep(2);
      setSelectedTrain(null); // Reset detail step
    } catch (err) {
      error("Train search failed");
    } finally {
      setIsSearching(false);
    }
  };

  const applyFilters = () => {
    let result = [...allTrains];

    // Filter by stations if search has run
    if (searchForm.source && searchForm.destination) {
      result = result.filter(
        t => t.sourceStationCode === searchForm.source && t.destinationStationCode === searchForm.destination
      );
    }

    // Filter by Train Type
    const activeTrainTypes = Object.keys(selectedTrainTypes).filter(k => selectedTrainTypes[k]);
    if (activeTrainTypes.length > 0) {
      result = result.filter((t) => {
        const name = t.trainName.toLowerCase();
        if (selectedTrainTypes.rajdhani && name.includes("rajdhani")) return true;
        if (selectedTrainTypes.shatabdi && name.includes("shatabdi")) return true;
        if (selectedTrainTypes.duronto && name.includes("duronto")) return true;
        if (selectedTrainTypes.superfast && (name.includes("sf") || name.includes("superfast") || name.includes("exp"))) return true;
        return false;
      });
    }

    setFilteredTrains(result);
  };

  const handleSelectTrain = (train, classCode) => {
    setSelectedTrain(train);
    setSelectedClass(classCode || "SL");
    setCurrentStep(3); // Move to Passengers & Seats step
    setSelectedSeats([]);
    setPassengers([]);
  };

  const handleSeatClick = (seat) => {
    if (seat.status === "occupied") return;

    if (selectedSeats.includes(seat.id)) {
      const idx = selectedSeats.indexOf(seat.id);
      setSelectedSeats(prev => prev.filter(id => id !== seat.id));
      setPassengers(prev => prev.filter((_, i) => i !== idx));
    } else {
      setSelectedSeats(prev => [...prev, seat.id]);
      setPassengers(prev => [...prev, { name: "", age: "", gender: "Male" }]);
    }
  };

  const handlePassengerChange = (index, field, value) => {
    const list = [...passengers];
    list[index] = { ...list[index], [field]: value };
    setPassengers(list);
  };

  const handleBookingSubmit = async () => {
    if (passengers.length === 0) {
      error("Please select at least one seat.");
      return;
    }

    for (const p of passengers) {
      if (!p.name || !p.age) {
        error("Please complete all passenger profiles");
        return;
      }
    }

    try {
      setIsBooking(true);
      const payload = {
        trainId: selectedTrain.id,
        sourceStationCode: searchForm.source,
        destinationStationCode: searchForm.destination,
        travelDate: searchForm.date,
        classType: selectedClass.replace("_", ""), // strip underscore if any
        seatCount: passengers.length,
        passengers: passengers
      };

      const res = await bookingAPI.createBooking(payload);
      success(`Booking confirmed! PNR: ${res.data.pnr}`);
      
      // Navigate to confirmation invoice
      navigate("/my-bookings", { state: { newBooking: res.data } });
    } catch (err) {
      logger.error("Booking API Failed", err);
      error(err.response?.data?.message || "Booking failed");
    } finally {
      setIsBooking(false);
    }
  };

  const baseFare = SEAT_PRICE_MAP[selectedClass] || 560;
  const totalAmount = baseFare * selectedSeats.length;
  const taxesAmount = totalAmount * 0.05; // 5% convenience/GST fee
  const grandTotal = totalAmount + taxesAmount;

  if (isLoading) return <Loader fullScreen text="Loading trains database..." />;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10 font-sans">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* STEP PROGRESS INDICATOR HEADER */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex justify-center items-center gap-10 md:gap-16 select-none">
        
        {/* Step 1 */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm shadow-blue-500/20">
            <Check className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-slate-700">Search</span>
        </div>

        <div className="h-0.5 w-12 bg-slate-200"></div>

        {/* Step 2 */}
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
            currentStep >= 2 ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20" : "bg-slate-100 text-slate-500"
          }`}>
            2
          </div>
          <span className={`text-xs font-bold ${currentStep >= 2 ? "text-slate-800" : "text-slate-400"}`}>Selection</span>
        </div>

        <div className="h-0.5 w-12 bg-slate-200"></div>

        {/* Step 3 */}
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
            currentStep >= 3 ? "bg-blue-600 text-white shadow-sm" : "bg-slate-100 text-slate-500"
          }`}>
            3
          </div>
          <span className={`text-xs font-bold ${currentStep >= 3 ? "text-slate-800" : "text-slate-400"}`}>Passengers</span>
        </div>

        <div className="h-0.5 w-12 bg-slate-200"></div>

        {/* Step 4 */}
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
            currentStep >= 4 ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
          }`}>
            4
          </div>
          <span className={`text-xs font-bold ${currentStep >= 4 ? "text-slate-800" : "text-slate-400"}`}>Payment</span>
        </div>

      </div>

      {/* SEARCH ROUTE CRITERIA HEADER BAR */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-5">
        <form onSubmit={handleSearch} className="flex-1 flex flex-wrap md:flex-nowrap items-center gap-4">
          
          <div className="flex-1 min-w-[150px] flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> From
            </span>
            <select
              value={searchForm.source}
              onChange={(e) => setSearchForm({ ...searchForm, source: e.target.value })}
              className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-700 font-bold focus:outline-none focus:bg-white focus:border-blue-500"
              required
            >
              <option value="">Select Origin</option>
              {stations.map((s) => (
                <option key={s.id} value={s.code}>{s.name} ({s.code})</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-center text-blue-600 hover:scale-105 cursor-pointer mt-5">
            <ArrowRight className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-[150px] flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> To
            </span>
            <select
              value={searchForm.destination}
              onChange={(e) => setSearchForm({ ...searchForm, destination: e.target.value })}
              className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-700 font-bold focus:outline-none focus:bg-white focus:border-blue-500"
              required
            >
              <option value="">Select Destination</option>
              {stations.filter(s => s.code !== searchForm.source).map((s) => (
                <option key={s.id} value={s.code}>{s.name} ({s.code})</option>
              ))}
            </select>
          </div>

          <div className="w-full md:w-auto min-w-[120px] flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Departure Date
            </span>
            <input
              type="date"
              value={searchForm.date}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setSearchForm({ ...searchForm, date: e.target.value })}
              className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-700 font-bold focus:outline-none focus:bg-white focus:border-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 px-6 rounded-xl shadow-sm transition-all md:mt-5"
            disabled={isSearching}
          >
            {isSearching ? "Loading..." : "Modify"}
          </button>
        </form>
      </div>

      {currentStep === 2 ? (
        /* ==================== STEP 2: SEARCH RESULTS & SIDEBAR FILTER ==================== */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          {/* LEFT: Quick Filters Sidebar */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-6 font-sans">
            <div className="flex justify-between items-center border-b pb-3">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-slate-500" /> Quick Filters
              </h4>
              <button
                onClick={() => {
                  setQuota("General");
                  setDepartureTimes({ earlyMorning: false, morning: true, afternoon: false, night: false });
                  setSelectedTrainTypes({ rajdhani: true, shatabdi: true, duronto: false, superfast: false });
                }}
                className="text-[10px] font-bold text-blue-600 hover:text-blue-700"
              >
                Reset All
              </button>
            </div>

            {/* Quota general / tatkal */}
            <div className="space-y-2">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quota</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setQuota("General")}
                  className={`py-2 px-3 rounded-lg text-xs font-bold border transition-colors ${
                    quota === "General" ? "bg-blue-50 border-blue-600 text-blue-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  General
                </button>
                <button
                  onClick={() => setQuota("Tatkal")}
                  className={`py-2 px-3 rounded-lg text-xs font-bold border transition-colors ${
                    quota === "Tatkal" ? "bg-blue-50 border-blue-600 text-blue-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Tatkal
                </button>
              </div>
            </div>

            {/* Departure times */}
            <div className="space-y-2.5">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Departure Time</span>
              <div className="space-y-2 text-xs font-bold text-slate-600">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={departureTimes.earlyMorning}
                    onChange={(e) => setDepartureTimes({ ...departureTimes, earlyMorning: e.target.checked })}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span>Early Morning (00-06)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={departureTimes.morning}
                    onChange={(e) => setDepartureTimes({ ...departureTimes, morning: e.target.checked })}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span>Morning (06-12)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={departureTimes.afternoon}
                    onChange={(e) => setDepartureTimes({ ...departureTimes, afternoon: e.target.checked })}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span>Afternoon (12-18)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={departureTimes.night}
                    onChange={(e) => setDepartureTimes({ ...departureTimes, night: e.target.checked })}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span>Night (18-24)</span>
                </label>
              </div>
            </div>

            {/* Class */}
            <div className="space-y-2.5">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Class</span>
              <div className="flex flex-wrap gap-1.5">
                {Object.keys(selectedClassesFilter).map((cls) => (
                  <button
                    key={cls}
                    onClick={() => setSelectedClassesFilter({ ...selectedClassesFilter, [cls]: !selectedClassesFilter[cls] })}
                    className={`px-2.5 py-1 rounded text-[10px] font-extrabold border transition-colors ${
                      selectedClassesFilter[cls]
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {cls}
                  </button>
                ))}
              </div>
            </div>

            {/* Train Type */}
            <div className="space-y-2.5 border-t pt-4">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Train Type</span>
              <div className="space-y-2 text-xs font-bold text-slate-600">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedTrainTypes.rajdhani}
                    onChange={(e) => setSelectedTrainTypes({ ...selectedTrainTypes, rajdhani: e.target.checked })}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span>Rajdhani Express</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedTrainTypes.shatabdi}
                    onChange={(e) => setSelectedTrainTypes({ ...selectedTrainTypes, shatabdi: e.target.checked })}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span>Shatabdi Express</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedTrainTypes.duronto}
                    onChange={(e) => setSelectedTrainTypes({ ...selectedTrainTypes, duronto: e.target.checked })}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span>Duronto</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedTrainTypes.superfast}
                    onChange={(e) => setSelectedTrainTypes({ ...selectedTrainTypes, superfast: e.target.checked })}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span>Superfast</span>
                </label>
              </div>
            </div>

          </div>

          {/* RIGHT: Results Train list */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-500">
                {hasSearched
                  ? `Showing ${filteredTrains.length} trains for ${searchForm.source} → ${searchForm.destination}`
                  : "All Available Routes"}
              </span>
              <div className="flex items-center gap-1 text-xs">
                <span className="text-slate-400 font-semibold">Sort by:</span>
                <select className="border border-slate-200 rounded-lg p-1 text-slate-700 font-bold focus:outline-none">
                  <option>Departure (Earliest)</option>
                  <option>Arrival (Earliest)</option>
                  <option>Duration (Shortest)</option>
                </select>
              </div>
            </div>

            {filteredTrains.length > 0 ? (
              <div className="space-y-4">
                {filteredTrains.map((t) => (
                  <TrainCard
                    key={t.id}
                    train={t}
                    source={searchForm.source}
                    destination={searchForm.destination}
                    onSelect={handleSelectTrain}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-10 text-center text-slate-500 shadow-sm">
                <span className="block text-4xl mb-3">🚂</span>
                <h5 className="font-bold text-slate-800 text-sm">No trains matching criteria found</h5>
                <p className="text-xs mt-1">Try adjust quick filters or search criteria.</p>
              </div>
            )}
          </div>

        </div>
      ) : (
        /* ==================== STEP 3: SEAT SELECTION & PASSENGER INFORMATION ==================== */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start font-sans select-none">
          
          {/* Left 2 Columns: Coach seat map & Passenger inputs */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Coach selection tab layout */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-center border-b pb-3 mb-4">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                  Select Coach & Seats: {selectedTrain.trainName}
                </h4>
                <span className="text-[10px] font-bold text-slate-400">
                  {selectedClass.replace("_", "")} Class | Oct 24
                </span>
              </div>

              {/* Coach tabs */}
              <div className="flex gap-2 border-b border-slate-100 pb-3 mb-5 overflow-x-auto">
                {Object.keys(coaches).map((coachKey) => {
                  const ch = coaches[coachKey];
                  const isSelected = selectedCoach === coachKey;
                  return (
                    <button
                      key={coachKey}
                      onClick={() => {
                        if (ch.status === "Full") return;
                        setSelectedCoach(coachKey);
                        setSelectedSeats([]);
                        setPassengers([]);
                      }}
                      className={`flex flex-col gap-0.5 px-4 py-2 border rounded-xl text-left min-w-[90px] transition-colors ${
                        ch.status === "Full"
                          ? "bg-slate-50 border-slate-100 opacity-50 cursor-not-allowed"
                          : isSelected
                          ? "border-blue-600 bg-blue-50/40 text-blue-700"
                          : "border-slate-200 hover:border-slate-300 text-slate-600"
                      }`}
                    >
                      <span className="text-xs font-black">{coachKey}</span>
                      <span className="text-[9px] font-bold opacity-80">
                        {ch.status === "Full" ? "Full" : `${ch.left} Left`}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Legend row */}
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-bold text-slate-500 mb-6 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded bg-slate-200"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded bg-blue-600"></div>
                  <span>Selected</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded bg-slate-400"></div>
                  <span>Occupied</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded border border-rose-300 bg-rose-50 text-rose-500"></div>
                  <span>Senior/Female</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded border border-amber-300 bg-amber-50 text-amber-500"></div>
                  <span>RAC</span>
                </div>
              </div>

              {/* Interactive Coach grid */}
              <div className="bg-slate-100/50 border border-slate-200/40 p-6 rounded-2xl flex items-center justify-center">
                <div className="grid grid-cols-4 gap-x-8 gap-y-4 max-w-sm">
                  {seatsLayout.map((seat) => {
                    const isSelected = selectedSeats.includes(seat.id);
                    let colorClasses = "bg-white border-slate-200 text-slate-700 hover:border-blue-300";
                    
                    if (seat.status === "occupied") {
                      colorClasses = "bg-slate-300 border-slate-300 text-slate-500 cursor-not-allowed opacity-60";
                    } else if (isSelected) {
                      colorClasses = "bg-blue-600 border-blue-600 text-white font-extrabold shadow shadow-blue-500/20";
                    } else if (seat.status === "senior-female") {
                      colorClasses = "bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100/50";
                    } else if (seat.status === "rac") {
                      colorClasses = "bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100/50";
                    }

                    return (
                      <button
                        key={seat.id}
                        onClick={() => handleSeatClick(seat)}
                        disabled={seat.status === "occupied"}
                        className={`w-14 h-12 border rounded-xl flex flex-col items-center justify-center text-[10px] font-bold transition-all ${colorClasses}`}
                      >
                        <span className="text-[11px] leading-tight font-black">{seat.id}</span>
                        <span className="text-[8px] font-semibold opacity-70 uppercase tracking-widest">{seat.type}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 flex items-start gap-2 bg-indigo-50 border border-indigo-100 rounded-xl p-3.5 text-indigo-900 text-xs">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Please note that for 3-tier AC, lower berths (LB) are prioritized for senior citizens and female passengers. RAC seats are indicated in yellow and may involve shared berth space.
                </p>
              </div>

            </div>

            {/* Passengers profiles list */}
            {selectedSeats.length > 0 && (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4 animate-fadeIn">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b pb-2">Passenger Information</h4>
                <div className="space-y-4">
                  {passengers.map((p, index) => (
                    <div key={index} className="bg-slate-50 border border-slate-200/50 rounded-xl p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-800">Passenger {index + 1} (Seat {selectedSeats[index]})</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Full Name</label>
                          <input
                            type="text"
                            placeholder="John Doe"
                            value={p.name}
                            onChange={(e) => handlePassengerChange(index, "name", e.target.value)}
                            className="border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-blue-500 font-bold bg-white"
                            required
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Age</label>
                          <input
                            type="number"
                            placeholder="28"
                            value={p.age}
                            onChange={(e) => handlePassengerChange(index, "age", e.target.value)}
                            className="border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-blue-500 font-bold bg-white"
                            min="1"
                            max="120"
                            required
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Gender</label>
                          <select
                            value={p.gender}
                            onChange={(e) => handlePassengerChange(index, "gender", e.target.value)}
                            className="border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-blue-500 font-bold bg-white"
                          >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Right 1 Column: Booking Summary panel */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b pb-2">Booking Summary</h4>
            
            {/* Selected Train overview */}
            <div className="bg-slate-50 border border-slate-200/40 rounded-xl p-4 flex gap-3 items-center">
              <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <TrainIcon className="w-5 h-5" />
              </div>
              <div className="leading-tight">
                <span className="font-bold text-slate-800 text-xs block">{selectedTrain.trainName}</span>
                <span className="text-[10px] font-semibold text-slate-400 mt-0.5 block">
                  {selectedTrain.trainNumber} | {searchForm.source} → {searchForm.destination}
                </span>
              </div>
            </div>

            {/* Selected seats list view */}
            <div className="space-y-1">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Selected Seats</span>
              <div className="flex flex-wrap gap-1.5 pt-1.5">
                {selectedSeats.length > 0 ? (
                  selectedSeats.map((id) => (
                    <span key={id} className="bg-blue-50 border border-blue-100 text-blue-700 font-extrabold text-[10px] py-1 px-2.5 rounded-lg">
                      {selectedCoach}-{id}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">No seats selected</span>
                )}
              </div>
            </div>

            {/* Fare Breakdown */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fare Breakdown</span>
              
              <div className="space-y-2 text-xs font-semibold text-slate-600">
                <div className="flex justify-between">
                  <span>Base Fare ({selectedSeats.length}x):</span>
                  <span className="font-bold text-slate-800">₹{totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes & GST (5%):</span>
                  <span className="font-bold text-slate-800">₹{taxesAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-3 text-sm font-black text-blue-700">
                  <span>Total Amount:</span>
                  <span>₹{grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Submit checkout CTA */}
            <div className="space-y-2 pt-2">
              <button
                onClick={handleBookingSubmit}
                disabled={selectedSeats.length === 0 || isBooking}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl text-xs shadow-sm transition-all text-center flex items-center justify-center gap-1.5"
              >
                {isBooking ? "Confirming Ticket..." : "Continue to Passenger Details"}
              </button>
              <button
                onClick={() => {
                  setSelectedTrain(null);
                  setCurrentStep(2);
                }}
                className="w-full border border-slate-200 text-slate-500 hover:bg-slate-50 font-bold py-2.5 px-4 rounded-xl text-xs transition-colors"
              >
                Back to Selection
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
