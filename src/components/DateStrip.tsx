"use client";

import React from "react";
import { CALENDAR_DEALS } from "@/data/mockConnections";
import type { TravelMode } from "@/types/travel";

interface DateStripProps {
  selectedDay: string;
  onSelect: (day: string) => void;
  mode?: TravelMode;
}

const GLASS =
  "bar-glass rounded-xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.15)]";

export function DateStrip({ selectedDay, onSelect, mode = "specific" }: DateStripProps) {
  const accent = mode === "tinder" ? "text-[#FE3C72]" : "text-[#1DB954]";

  return (
    <section aria-label="Flexible dates">
      <div
        role="group"
        className={`scrollbar-none flex snap-x gap-1 overflow-x-auto p-1 ${GLASS}`}
      >
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
              className={`flex min-w-[76px] flex-1 snap-start flex-col items-center rounded-lg px-2.5 py-2.5 transition-colors ${
                isSelected
                  ? mode === "tinder"
                    ? "bg-[#FE3C72]/15 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.15)]"
                    : "bg-white/[0.08] shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.15)]"
                  : "hover:bg-white/[0.04]"
              }`}
            >
              <span className="text-[11px] font-medium text-zinc-500">
                {weekday}
              </span>
              <span className="mt-1 text-base font-semibold tabular-nums text-white">
                {dayNumber}
              </span>
              <span
                className={`mt-1 text-xs tabular-nums ${
                  isSelected ? accent : "text-zinc-400"
                }`}
              >
                {deal.price}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
