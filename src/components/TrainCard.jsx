import React, { useState } from "react";
import { Train, Clock, ArrowRight } from "lucide-react";

const TrainCard = ({
  train,
  source,
  destination,
  onSelect
}) => {
  const [selectedClass, setSelectedClass] = useState("SL");

  // Mock some class options with pricing and availability for visual fidelity
  const mockClassInfo = {
    SL: {
      label: "Sleeper (SL)",
      fare: 560,
      availability: "AVAILABLE-0112",
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
      updated: "Updated: 1 hour ago"
    },
    _3A: {
      label: "AC 3 Tier (3A)",
      fare: 1445,
      availability: "WL 45/WL 18",
      color: "text-amber-600 bg-amber-50 border-amber-100",
      updated: "Updated: 2 mins ago"
    },
    _2A: {
      label: "AC 2 Tier (2A)",
      fare: 2845,
      availability: "AVAILABLE-0042",
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
      updated: "Updated: 2 mins ago"
    },
    _1A: {
      label: "AC 1st Class (1A)",
      fare: 4820,
      availability: "AVAILABLE-0008",
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
      updated: "Updated: 10 mins ago"
    }
  };

  const handleClassClick = (clsCode, e) => {
    e.stopPropagation();
    setSelectedClass(clsCode);
  };

  const handleBookClick = (e) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(train, selectedClass);
    }
  };

  // Extract dummy times and stops for layout representation
  const departureTime = train.departureTime || "16:55";
  const arrivalTime = train.arrivalTime || "08:30";
  const duration = train.duration || "15h 35m";
  const stops = train.stops || "7 Stops";

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col gap-5 hover:shadow-md transition-all select-none font-sans">
      
      {/* Train Info Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
          <Train className="w-5 h-5" />
        </div>
        <div className="leading-none">
          <h4 className="font-extrabold text-slate-800 text-sm tracking-tight uppercase">
            {train.trainName}
          </h4>
          <span className="text-[10px] font-bold text-slate-400 mt-1 block">
            {train.trainNumber} | Runs: M T W T F S S
          </span>
        </div>
      </div>

      {/* Train Time Duration Row */}
      <div className="flex items-center justify-between py-2 border-y border-slate-50">
        
        {/* Departure */}
        <div className="text-left">
          <span className="block text-lg font-black text-slate-800">{departureTime}</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{source || "NDLS"}</span>
        </div>

        {/* Duration line */}
        <div className="flex-1 flex flex-col items-center px-6 relative">
          <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 border border-slate-100 rounded-full z-10">
            {duration}
          </span>
          <div className="w-full border-t border-slate-200 absolute top-1/2 -translate-y-1/2"></div>
          <span className="text-[9px] font-bold text-slate-400 mt-1 block tracking-wider uppercase">
            {stops}
          </span>
        </div>

        {/* Arrival */}
        <div className="text-right">
          <span className="block text-lg font-black text-slate-800">{arrivalTime}</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{destination || "MMCT"}</span>
        </div>

      </div>

      {/* Class Fare Cards list */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.keys(mockClassInfo).map((clsKey) => {
          const item = mockClassInfo[clsKey];
          const isSelected = selectedClass === clsKey;
          return (
            <div
              key={clsKey}
              onClick={(e) => handleClassClick(clsKey, e)}
              className={`border rounded-xl p-3 cursor-pointer transition-all flex flex-col gap-1 text-left ${
                isSelected
                  ? "border-blue-600 bg-blue-50/40 ring-1 ring-blue-500"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                <span>{clsKey.replace("_", "")}</span>
                <span className="text-slate-800 font-extrabold">₹{item.fare}</span>
              </div>
              <span className={`text-[10px] font-bold py-0.5 rounded text-center mt-1.5 ${item.color}`}>
                {item.availability}
              </span>
              <span className="text-[8px] font-semibold text-slate-400 text-right mt-1">
                {item.updated}
              </span>
            </div>
          );
        })}
      </div>

      {/* Footer detail toggle & Book now button */}
      <div className="flex justify-between items-center pt-2 border-t border-slate-50">
        <button
          onClick={(e) => {
            e.stopPropagation();
            alert(`Train Details:\nName: ${train.trainName}\nNumber: ${train.trainNumber}\nFrom: ${source}\nTo: ${destination}`);
          }}
          className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
        >
          Details
        </button>

        <button
          onClick={handleBookClick}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-5 rounded-xl shadow-sm transition-all"
        >
          Book Now
        </button>
      </div>

    </div>
  );
};

export default TrainCard;
