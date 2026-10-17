"use client";

import React, { useState } from "react";
import { ArrowRightLeft, Calendar } from "lucide-react";

interface SearchWidgetProps {
  onSearch?: (criteria: { from: string; to: string; date: string; passengers: number }) => void;
  className?: string;
}

export function SearchWidget({ onSearch, className = "" }: SearchWidgetProps) {
  const [from, setFrom] = useState("Berlin Hbf");
  const [to, setTo] = useState("München Hbf");
  const [date, setDate] = useState("2026-10-24");

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
    <div className={`w-full max-w-4xl mx-auto p-4 ${className}`}>
      <form
        onSubmit={handleSubmit}
        className="bg-[#161618] border border-white/10 rounded-2xl p-2 flex flex-col md:flex-row items-center gap-2 shadow-2xl backdrop-blur-xl"
      >
        {/* From */}
        <div className="flex-1 w-full px-4 py-3 bg-white/[0.04] rounded-xl border border-white/5 flex items-center gap-3">
          <span className="text-zinc-500 text-xs font-medium uppercase tracking-wider shrink-0">
            From
          </span>
          <input
            type="text"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            placeholder="Berlin Hbf"
            className="w-full bg-transparent text-white placeholder-zinc-600 focus:outline-none text-sm font-medium"
          />
        </div>

        {/* Swap button */}
        <button
          type="button"
          onClick={handleSwap}
          aria-label="Swap departure and destination"
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors shrink-0"
        >
          <ArrowRightLeft className="w-4 h-4" />
        </button>

        {/* To */}
        <div className="flex-1 w-full px-4 py-3 bg-white/[0.04] rounded-xl border border-white/5 flex items-center gap-3">
          <span className="text-zinc-500 text-xs font-medium uppercase tracking-wider shrink-0">
            To
          </span>
          <input
            type="text"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="München Hbf"
            className="w-full bg-transparent text-white placeholder-zinc-600 focus:outline-none text-sm font-medium"
          />
        </div>

        {/* When */}
        <div className="w-full md:w-44 px-4 py-3 bg-white/[0.04] rounded-xl border border-white/5 flex items-center gap-3">
          <Calendar className="w-4 h-4 text-zinc-500 shrink-0" />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-transparent text-white focus:outline-none text-sm font-medium [color-scheme:dark]"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full md:w-auto px-6 py-3.5 bg-white text-black rounded-xl font-medium text-sm hover:bg-zinc-200 active:scale-[0.98] transition-all shrink-0 cursor-pointer"
        >
          Search
        </button>
      </form>
    </div>
  );
}

export default SearchWidget;
