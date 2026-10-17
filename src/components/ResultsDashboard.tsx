"use client";

import React, { useMemo, useState } from "react";
import { JourneyOffer } from "@/types/rail";
import { ConnectionCard } from "./ConnectionCard";
import {
  formatDay,
  formatDuration,
  formatPrice,
  isoDateRange,
  toDateKey,
} from "@/lib/format";

interface ResultsDashboardProps {
  offers: JourneyOffer[];
  fromStation: string;
  toStation: string;
  /** Centre of the 7-day fare calendar; also the initially selected day. */
  initialDate?: string;
}

export function ResultsDashboard({
  offers,
  fromStation,
  toStation,
  initialDate,
}: ResultsDashboardProps) {
  const [activeTab, setActiveTab] = useState<"cheapest" | "fastest" | "best">("cheapest");
  const [maxTransfers, setMaxTransfers] = useState<number | "all">("all");
  const [selectedDay, setSelectedDay] = useState<string | null>(
    initialDate ?? null,
  );

  const fareDays = useMemo(() => {
    const cheapestByDay = new Map<string, number>();

    for (const offer of offers) {
      const date = toDateKey(offer.departure);
      const current = cheapestByDay.get(date);
      if (current === undefined || offer.priceInCents < current) {
        cheapestByDay.set(date, offer.priceInCents);
      }
    }

    const centreDate =
      initialDate ??
      [...cheapestByDay.keys()].sort((left, right) =>
        left.localeCompare(right),
      )[0];

    if (!centreDate) return [];

    return isoDateRange(centreDate, 3, 3).map((date) => ({
      date,
      label: formatDay(date),
      priceInCents: cheapestByDay.get(date) ?? null,
    }));
  }, [offers, initialDate]);

  const cheapestCalendarPrice = fareDays.reduce<number | null>(
    (cheapest, day) =>
      day.priceInCents !== null &&
      (cheapest === null || day.priceInCents < cheapest)
        ? day.priceInCents
        : cheapest,
    null,
  );

  const activeDay =
    (selectedDay && fareDays.some((day) => day.date === selectedDay)
      ? selectedDay
      : initialDate ?? fareDays.find((day) => day.priceInCents !== null)?.date) ??
    null;

  const dayOffers = activeDay
    ? offers.filter((offer) => toDateKey(offer.departure) === activeDay)
    : offers;

  const filteredOffers = dayOffers
    .filter((offer) => {
      if (maxTransfers === "all") return true;
      return offer.transfers <= maxTransfers;
    })
    .sort((a, b) => {
      if (activeTab === "cheapest") return a.priceInCents - b.priceInCents;
      if (activeTab === "fastest") return a.durationMinutes - b.durationMinutes;
      return (
        a.priceInCents + a.transfers * 1500 -
        (b.priceInCents + b.transfers * 1500)
      );
    });

  const lowestPrice = dayOffers.length
    ? Math.min(...dayOffers.map((offer) => offer.priceInCents))
    : 0;
  const fastestDuration = dayOffers.length
    ? formatDuration(
        Math.min(...dayOffers.map((offer) => offer.durationMinutes)),
      )
    : "—";

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">

      {/* Route Header & Fare Matrix (Obsidian Black with subtle Terminal Green undertone) */}
      <div className="rounded-2xl bg-[#09090B]/90 border border-white/10 p-5 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-[#FAFAFA]">
              {fromStation} to {toStation}
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              {filteredOffers.length} verified Deutsche Bahn connections
            </p>
          </div>
        </div>

        {/* Date Matrix */}
        {fareDays.length > 0 ? (
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
            {fareDays.map((deal) => {
              const isSelected = activeDay === deal.date;
              const isLowest =
                deal.priceInCents !== null &&
                deal.priceInCents === cheapestCalendarPrice;
              return (
                <button
                  key={deal.date}
                  onClick={() => setSelectedDay(deal.date)}
                  className={`py-2 px-1 rounded-xl text-center transition-colors border cursor-pointer ${
                    isSelected
                      ? "bg-[#2563EB] text-white border-[#2563EB] font-semibold shadow-md shadow-blue-500/20"
                      : isLowest
                      ? "bg-[#052E16] border-[#10B981]/40 text-[#10B981]"
                      : "bg-white/[0.03] border-white/5 text-zinc-400 hover:text-[#FAFAFA] hover:border-white/10"
                  }`}
                >
                  <div className={`text-[10px] ${isSelected ? "text-blue-100 font-medium" : "text-zinc-400"}`}>
                    {deal.label}
                  </div>
                  <div className="text-xs font-bold mt-0.5">
                    {deal.priceInCents !== null
                      ? formatPrice(deal.priceInCents)
                      : "—"}
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-zinc-400">No fares available for this route.</p>
        )}
      </div>

      {/* Sorting Segment Control */}
      <div className="flex items-center justify-between gap-3">
        <div className="inline-flex p-1 rounded-xl bg-[#09090B]/90 border border-white/10">
          <button
            onClick={() => setActiveTab("cheapest")}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === "cheapest"
                ? "bg-[#2563EB] text-white font-semibold shadow-sm"
                : "text-zinc-400 hover:text-[#FAFAFA]"
            }`}
          >
            Cheapest · {formatPrice(lowestPrice)}
          </button>
          <button
            onClick={() => setActiveTab("fastest")}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === "fastest"
                ? "bg-[#2563EB] text-white font-semibold shadow-sm"
                : "text-zinc-400 hover:text-[#FAFAFA]"
            }`}
          >
            Fastest · {fastestDuration}
          </button>
          <button
            onClick={() => setActiveTab("best")}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === "best"
                ? "bg-[#2563EB] text-white font-semibold shadow-sm"
                : "text-zinc-400 hover:text-[#FAFAFA]"
            }`}
          >
            Recommended
          </button>
        </div>

        {/* Transfers filter */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-400">
          <span>Stops:</span>
          <button
            onClick={() => setMaxTransfers("all")}
            className={`px-2 py-0.5 rounded text-[11px] cursor-pointer ${maxTransfers === "all" ? "text-white bg-white/10" : "hover:text-white"}`}
          >
            All
          </button>
          <button
            onClick={() => setMaxTransfers(0)}
            className={`px-2 py-0.5 rounded text-[11px] cursor-pointer ${maxTransfers === 0 ? "text-white bg-white/10" : "hover:text-white"}`}
          >
            Direct
          </button>
        </div>
      </div>

      {/* Connections List */}
      <div className="space-y-3">
        {filteredOffers.map((offer) => (
          <ConnectionCard key={offer.id} offer={offer} />
        ))}

        {filteredOffers.length === 0 && (
          <div className="rounded-2xl bg-[#09090B]/90 border border-white/10 p-6 text-center">
            <p className="text-sm text-zinc-300">
              No connections found for this route and date.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
