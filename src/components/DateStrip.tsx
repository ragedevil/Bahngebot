"use client";

import React from "react";
import { CALENDAR_DEALS } from "@/data/mockConnections";

interface DateStripProps {
  selectedDay: string;
  onSelect: (day: string) => void;
}

export function DateStrip({ selectedDay, onSelect }: DateStripProps) {
  return (
    <section aria-label="Flexible dates and lowest fares">
      <div className="mb-3 flex items-end justify-between px-0.5">
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
          Flexible dates
        </h2>
        <span className="text-[10px] font-medium text-muted/70">
          Lowest fare per day
        </span>
      </div>

      <div className="scrollbar-none flex snap-x gap-1 overflow-x-auto rounded-lg border border-hairline bg-surface p-1">
        {CALENDAR_DEALS.map((deal) => {
          const [weekday, dayNumber] = deal.day.split(" ");
          const isSelected = selectedDay === deal.day;

          return (
            <button
              key={deal.day}
              type="button"
              onClick={() => onSelect(deal.day)}
              aria-pressed={isSelected}
              aria-label={`${deal.day}, from ${deal.price}`}
              className={`relative flex min-w-[76px] flex-1 snap-start flex-col items-center rounded-md border px-2.5 pb-2.5 pt-2 text-center transition-colors duration-200 sm:min-w-[86px] ${
                isSelected
                  ? "border-brand/70 bg-brand/[0.07]"
                  : "border-transparent hover:border-hairline hover:bg-surface-raised"
              }`}
            >
              <span
                className={`text-[9px] font-semibold uppercase leading-none tracking-[0.14em] ${
                  isSelected ? "text-ink" : "text-muted"
                }`}
              >
                {weekday}
              </span>
              <span className="mt-1.5 text-[17px] font-semibold leading-none tracking-[-0.035em] text-ink tabular-nums">
                {dayNumber}
              </span>
              <span
                className={`mt-2 text-[10px] font-medium leading-none tabular-nums ${
                  isSelected ? "text-ink" : "text-muted"
                }`}
              >
                {deal.price}
              </span>

              {isSelected && (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-3 top-0 h-0.5 bg-brand/80"
                />
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
