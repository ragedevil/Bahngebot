"use client";

import React, { useRef, useState } from "react";
import { ArrowRightLeft, Calendar, MapPin, Search } from "lucide-react";

interface SpecificRouteWidgetProps {
  onSearch?: (criteria: {
    from: string;
    to: string;
    date: string;
    passengers: number;
  }) => void;
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
  const dateInputRef = useRef<HTMLInputElement>(null);

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
  };

  const openDatePicker = () => {
    const input = dateInputRef.current;
    if (!input) return;

    try {
      input.showPicker?.();
    } catch {
      input.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.({ from, to, date, passengers: 1 });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`glass w-full rounded-[24px] p-2 ${className}`}
    >
      <div className="flex flex-col gap-1 lg:flex-row lg:items-center lg:gap-0">
        {/* Origin and destination share one continuous glass surface. */}
        <div className="flex min-w-0 flex-1 flex-col sm:flex-row sm:items-center">
          <div className="dock-field flex min-w-0 flex-1 items-center gap-3 px-3.5 py-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-brand/20 bg-brand/10 text-brand">
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
            </span>
            <div className="min-w-0 flex-1">
              <label htmlFor="route-from" className="field-label">
                From
              </label>
              <input
                id="route-from"
                type="text"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                placeholder="Origin station"
                autoComplete="off"
                className="w-full truncate bg-transparent text-[14px] font-medium text-ink placeholder:text-muted/70 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-center sm:contents">
            <span className="dock-divider hidden sm:block" aria-hidden="true" />
            <button
              type="button"
              onClick={handleSwap}
              aria-label="Swap departure and arrival stations"
              className="glass-soft my-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted transition-apple hover:scale-105 hover:border-ink/15 hover:text-ink active:scale-95 sm:mx-2.5 sm:my-0"
            >
              <ArrowRightLeft className="h-3.5 w-3.5" strokeWidth={1.9} />
            </button>
            <span className="dock-divider hidden sm:block" aria-hidden="true" />
          </div>

          <div className="dock-field flex min-w-0 flex-1 items-center gap-3 px-3.5 py-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-hairline bg-surface-raised text-muted">
              <MapPin className="h-3.5 w-3.5" strokeWidth={1.9} />
            </span>
            <div className="min-w-0 flex-1">
              <label htmlFor="route-to" className="field-label">
                To
              </label>
              <input
                id="route-to"
                type="text"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="Destination station"
                autoComplete="off"
                className="w-full truncate bg-transparent text-[14px] font-medium text-ink placeholder:text-muted/70 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <span
          className="dock-divider mx-1 hidden lg:block"
          aria-hidden="true"
        />

        {/* Date */}
        <div
          onClick={openDatePicker}
          className="dock-field flex cursor-pointer items-center gap-3 px-3.5 py-3 lg:w-[190px]"
        >
          <Calendar
            className="h-4 w-4 shrink-0 text-muted"
            strokeWidth={1.8}
          />
          <div className="min-w-0 flex-1">
            <label htmlFor="route-date" className="field-label">
              Departure
            </label>
            <input
              ref={dateInputRef}
              id="route-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full cursor-pointer bg-transparent text-[13px] font-medium text-ink focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          className="btn-apple-blue mt-1 h-[50px] shrink-0 rounded-xl px-5 text-[13px] lg:ml-2 lg:mt-0"
        >
          <Search className="h-4 w-4" strokeWidth={2.1} />
          <span>Search</span>
        </button>
      </div>
    </form>
  );
}
