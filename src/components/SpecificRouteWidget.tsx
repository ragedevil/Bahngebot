"use client";

import React, { useRef, useState } from "react";
import { ArrowLeftRight, Calendar, Search } from "lucide-react";
import { StationInput } from "./StationInput";

interface SearchCriteria {
  from: string;
  to: string;
  date: string;
  passengers: number;
}

interface SpecificRouteWidgetProps {
  onSearch?: (criteria: SearchCriteria) => void;
  className?: string;
  initialFrom?: string;
  initialTo?: string;
  initialDate?: string;
}

/** ISO date → "24.10.2026", independent of the browser locale. */
function formatDateDisplay(isoDate: string) {
  const [year, month, day] = isoDate.split("-");
  return year && month && day ? `${day}.${month}.${year}` : isoDate;
}

const swapButtonClass =
  "z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-600 shadow-sm transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:border-white/10 dark:bg-white/[0.06] dark:text-zinc-400 dark:shadow-none dark:hover:bg-white/[0.12] dark:hover:text-white";

/**
 * The search dock. Wide screens read left to right: origin, swap, station,
 * date, CTA — each station field wide enough that long names never collide
 * with the labels. The swap control floats in the gap between the two station
 * fields, which carry no inner borders, so no rule ever runs past it. Phones
 * stack it as a two-station ticket — a route spine with an origin marker, a
 * swap control and a destination marker — then date/CTA.
 */
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.({ from, to, date, passengers: 1 });
  };

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="Find connections"
      className={`route-dock ${className}`}
    >
      {/* Phones: station ticket. */}
      <div className="px-6 py-4 md:hidden">
        {/* Positioned against the two stacked stations only. */}
        <div className="relative flex flex-col gap-3">
          {/* Route spine tying the two markers together. */}
          <span
            aria-hidden="true"
            className="absolute left-[3px] top-7 bottom-7 w-px bg-gradient-to-b from-[#1DB954]/60 via-white/15 to-[#1DB954]/60"
          />

          <div className="route-field pl-5">
            <span
              aria-hidden="true"
              className="absolute left-0 top-1/2 h-[7px] w-[7px] -translate-y-1/2 rounded-full border border-[#1DB954]"
            />
            <label htmlFor="route-from" className="route-label">
              From
            </label>
            <StationInput
              id="route-from"
              value={from}
              onChange={setFrom}
              placeholder="Origin station"
              required
              inputClassName="route-input"
            />
          </div>

          <div className="route-field pl-5">
            <span
              aria-hidden="true"
              className="absolute left-0 top-1/2 h-[7px] w-[7px] -translate-y-1/2 rounded-full bg-[#1DB954] shadow-[0_0_8px_rgba(29,185,84,0.7)]"
            />
            <label htmlFor="route-to" className="route-label">
              To
            </label>
            <StationInput
              id="route-to"
              value={to}
              onChange={setTo}
              placeholder="Destination station"
              required
              inputClassName="route-input"
            />
          </div>

          <button
            type="button"
            onClick={handleSwap}
            aria-label="Swap departure and arrival stations"
            className={`absolute right-0 top-1/2 -translate-y-1/2 ${swapButtonClass}`}
          >
            <ArrowLeftRight className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Wide: one line, one dock. */}
      <div className="hidden md:flex md:items-stretch">
        <div className="route-field">
          <label htmlFor="route-from-desktop" className="route-label">
            From
          </label>
          <StationInput
            id="route-from-desktop"
            value={from}
            onChange={setFrom}
            placeholder="Origin station"
            required
            inputClassName="route-input"
          />
        </div>

        <div className="flex shrink-0 items-center px-3">
          <button
            type="button"
            onClick={handleSwap}
            aria-label="Swap departure and arrival stations"
            className={swapButtonClass}
          >
            <ArrowLeftRight className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        <div className="route-field">
          <label htmlFor="route-to-desktop" className="route-label">
            To
          </label>
          <StationInput
            id="route-to-desktop"
            value={to}
            onChange={setTo}
            placeholder="Destination station"
            required
            inputClassName="route-input"
          />
        </div>

        <div className="route-field w-56 cursor-pointer border-l border-zinc-200 dark:border-white/[0.06]">
          <label htmlFor="route-date-desktop" className="route-label">
            Date
          </label>
          <div className="relative mt-0.5 flex items-center gap-3">
            <Calendar
              className="h-4 w-4 shrink-0 text-zinc-500 dark:text-zinc-400"
              strokeWidth={2}
              aria-hidden="true"
            />
            <div className="relative min-w-0 flex-1">
              <input
                ref={dateInputRef}
                id="route-date-desktop"
                type="date"
                value={date}
                data-display={formatDateDisplay(date)}
                onChange={(e) => setDate(e.target.value)}
                className="block w-full cursor-pointer bg-transparent text-base font-medium leading-normal tabular-nums text-zinc-900 focus:outline-none dark:text-white"
              />
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center p-4">
          <button
            type="submit"
            aria-label="Find connections"
            className="inline-flex h-12 w-12 items-center justify-center gap-2 rounded-xl bg-[#1DB954] text-base font-semibold text-black shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.35)] transition-all hover:bg-[#1ED760] active:scale-[0.98] xl:h-auto xl:w-auto xl:px-7 xl:py-3.5"
          >
            <Search className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
            <span className="hidden xl:inline">Find connections</span>
          </button>
        </div>
      </div>

      {/* Phones: date and CTA under the ticket. */}
      <div className="flex items-center gap-3 border-t border-zinc-200 px-6 pb-4 pt-3 dark:border-white/[0.06] md:hidden">
        <div className="flex h-12 flex-1 items-center gap-3 rounded-xl px-1">
          <Calendar
            className="h-4 w-4 shrink-0 text-zinc-500 dark:text-zinc-400"
            strokeWidth={2}
            aria-hidden="true"
          />
          <div className="relative min-w-0 flex-1">
            <label htmlFor="route-date" className="route-label">
              Date
            </label>
            <input
              ref={dateInputRef}
              id="route-date"
              type="date"
              value={date}
              data-display={formatDateDisplay(date)}
              onChange={(e) => setDate(e.target.value)}
              className="w-full cursor-pointer bg-transparent text-base font-medium leading-normal tabular-nums text-zinc-900 focus:outline-none dark:text-white"
            />
          </div>
        </div>

        <button
          type="submit"
          aria-label="Find connections"
          className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#1DB954] px-5 text-base font-semibold text-black shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.35)] transition-all hover:bg-[#1ED760] active:scale-[0.98]"
        >
          <Search className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
          <span className="hidden min-[420px]:inline">Find connections</span>
        </button>
      </div>
    </form>
  );
}
