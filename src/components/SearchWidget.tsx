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
        className="app-card rounded-2xl p-2 flex flex-col md:flex-row items-center gap-2"
      >
        {/* From */}
        <div className="flex-1 w-full px-4 py-3 bg-surface-raised rounded-xl flex items-center gap-3">
          <span className="text-muted text-xs font-medium uppercase tracking-wider shrink-0">
            From
          </span>
          <input
            type="text"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            placeholder="Berlin Hbf"
            className="w-full bg-transparent text-ink placeholder:text-muted/70 focus:outline-none text-sm font-medium"
          />
        </div>

        {/* Swap button */}
        <button
          type="button"
          onClick={handleSwap}
          aria-label="Swap departure and destination"
          className="p-2 rounded-xl bg-surface hover:bg-surface-raised text-muted hover:text-ink transition-colors shrink-0"
        >
          <ArrowRightLeft className="w-4 h-4" />
        </button>

        {/* To */}
        <div className="flex-1 w-full px-4 py-3 bg-surface-raised rounded-xl flex items-center gap-3">
          <span className="text-muted text-xs font-medium uppercase tracking-wider shrink-0">
            To
          </span>
          <input
            type="text"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="München Hbf"
            className="w-full bg-transparent text-ink placeholder:text-muted/70 focus:outline-none text-sm font-medium"
          />
        </div>

        {/* When */}
        <div className="w-full md:w-44 px-4 py-3 bg-surface-raised rounded-xl flex items-center gap-3">
          <Calendar className="w-4 h-4 text-muted shrink-0" />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-transparent text-ink focus:outline-none text-sm font-medium"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full md:w-auto px-6 py-3.5 bg-ink text-canvas rounded-xl font-medium text-sm hover:opacity-90 active:scale-[0.98] transition-all shrink-0 cursor-pointer"
        >
          Search
        </button>
      </form>
    </div>
  );
}

export default SearchWidget;
