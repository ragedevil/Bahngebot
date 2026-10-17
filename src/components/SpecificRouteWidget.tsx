"use client";

import React, { useState } from "react";
import { ArrowRightLeft, Calendar, Search } from "lucide-react";

interface SpecificRouteWidgetProps {
  onSearch?: (criteria: { from: string; to: string; date: string; passengers: number }) => void;
  className?: string;
  initialFrom?: string;
  initialTo?: string;
  initialDate?: string;
}

export function SpecificRouteWidget({
  onSearch,
  className = "",
  initialFrom = "Berlin Hbf",
  initialTo = "München Hbf",
  initialDate = "2026-10-24",
}: SpecificRouteWidgetProps) {
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const [date, setDate] = useState(initialDate);

  const handleSwap = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch({ from, to, date, passengers: 1 });
    }
  };

  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
      <form
        onSubmit={handleSubmit}
        className="bg-white/[0.08] rounded-3xl p-3 flex flex-col md:flex-row items-center gap-2.5 shadow-2xl backdrop-blur-2xl"
      >
        {/* From */}
        <div className="flex-1 w-full px-4 py-3.5 bg-white/[0.06] rounded-2xl flex items-center gap-3">
          <span className="text-zinc-400 text-xs font-medium uppercase tracking-wider shrink-0">
            From
          </span>
          <input
            type="text"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            placeholder="Origin (e.g. Berlin Hbf)"
            className="w-full bg-transparent text-[#FAFAFA] placeholder-zinc-500 focus:outline-none text-sm font-medium"
          />
        </div>

        {/* Swap button */}
        <button
          type="button"
          onClick={handleSwap}
          aria-label="Swap departure and arrival"
          className="p-3 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] text-zinc-300 hover:text-white transition-colors shrink-0 cursor-pointer"
        >
          <ArrowRightLeft className="w-4 h-4" />
        </button>

        {/* To */}
        <div className="flex-1 w-full px-4 py-3.5 bg-white/[0.06] rounded-2xl flex items-center gap-3">
          <span className="text-zinc-400 text-xs font-medium uppercase tracking-wider shrink-0">
            To
          </span>
          <input
            type="text"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="Destination (e.g. München Hbf)"
            className="w-full bg-transparent text-[#FAFAFA] placeholder-zinc-500 focus:outline-none text-sm font-medium"
          />
        </div>

        {/* When */}
        <div className="w-full md:w-44 px-4 py-3.5 bg-white/[0.06] rounded-2xl flex items-center gap-3">
          <Calendar className="w-4 h-4 text-zinc-400 shrink-0" />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-transparent text-[#FAFAFA] focus:outline-none text-sm font-medium [color-scheme:dark] cursor-pointer"
          />
        </div>

        {/* Action Button: Electric Cobalt (#2563EB) */}
        <button
          type="submit"
          className="w-full md:w-auto px-7 py-4 bg-[#2563EB] hover:bg-blue-600 text-white rounded-2xl font-semibold text-sm shadow-xl shadow-blue-500/25 active:scale-[0.98] transition-all shrink-0 cursor-pointer flex items-center justify-center gap-2"
        >
          <Search className="w-4 h-4 stroke-[2.5]" />
          <span>Search</span>
        </button>
      </form>
    </div>
  );
}
