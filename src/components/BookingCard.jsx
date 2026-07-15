import React from "react";
import {
  Train,
  Calendar,
  MapPin,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight
} from "lucide-react";

const BookingCard = ({ booking, onCancel, onViewDetails }) => {
  const isCancelled = booking.status?.toLowerCase() === "cancelled";
  const isConfirmed = booking.status?.toLowerCase() === "confirmed";

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden hover:shadow-md transition-all font-sans select-none flex flex-col justify-between h-full">
      {/* Header Info */}
      <div className="flex justify-between items-center px-5 py-3.5 bg-slate-50/60 border-b border-slate-100">
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PNR:</span>
          <span className="font-mono font-bold text-xs text-slate-800 tracking-wider">
            {booking.pnr}
          </span>
        </div>

        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
          isCancelled
            ? "text-red-600 bg-red-50 border border-red-100"
            : isConfirmed
            ? "text-emerald-600 bg-emerald-50 border border-emerald-100"
            : "text-amber-600 bg-amber-50 border border-amber-100"
        }`}>
          {isCancelled ? <XCircle className="w-3 h-3" /> : isConfirmed ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
          {booking.status}
        </span>
      </div>

      {/* Body details */}
      <div className="p-5 space-y-4">
        {/* Train Details */}
        <div className="flex gap-3 items-center">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700">
            <Train className="w-4.5 h-4.5" />
          </div>
          <div className="leading-tight">
            <span className="text-xs font-bold text-slate-800 block uppercase">{booking.trainName}</span>
            <span className="text-[10px] text-slate-400 font-bold mt-0.5 block">{booking.trainNumber}</span>
          </div>
        </div>

        {/* Route Details */}
        <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3 flex justify-between items-center">
          <div className="text-left">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">From</span>
            <span className="text-sm font-black text-slate-700 block mt-0.5">{booking.sourceStationCode}</span>
          </div>
          
          <ArrowRight className="w-4 h-4 text-slate-300" />

          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">To</span>
            <span className="text-sm font-black text-slate-700 block mt-0.5">{booking.destinationStationCode}</span>
          </div>
        </div>

        {/* Meta data row */}
        <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 bg-slate-50/20 px-1 py-1 rounded">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            {new Date(booking.travelDate).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric"
            })}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            {booking.seatCount} Seat(s)
          </span>
          <span className="bg-slate-100 border border-slate-200/40 text-slate-600 px-2 py-0.5 rounded text-[9px] uppercase font-bold">
            {booking.classType}
          </span>
        </div>

      </div>

      {/* Action Footer */}
      <div className="flex items-center gap-2.5 px-5 py-4 border-t border-slate-100/80 bg-white">
        {onViewDetails && (
          <button
            onClick={() => onViewDetails(booking)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-3 rounded-xl shadow-sm transition-all"
          >
            View Details
          </button>
        )}

        {onCancel && !isCancelled && (
          <button
            onClick={() => onCancel(booking.id)}
            className="border border-red-200 text-red-500 hover:bg-red-50 font-bold text-xs py-2 px-3 rounded-xl transition-all"
          >
            Cancel
          </button>
        )}
      </div>

    </div>
  );
};

export default BookingCard;
