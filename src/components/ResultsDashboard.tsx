"use client";

import React, { useState } from "react";
import { TrainConnection } from "@/types/connection";
import { ConnectionCard } from "./ConnectionCard";
import { DateStrip } from "./DateStrip";

interface ResultsDashboardProps {
  connections: TrainConnection[];
  fromStation: string;
  toStation: string;
}

const durationInMinutes = (duration: string) => {
  const hours = Number(duration.match(/(\d+)h/)?.[1] ?? 0);
  const minutes = Number(duration.match(/(\d+)m/)?.[1] ?? 0);
  return hours * 60 + minutes;
};

type SortMode = "cheapest" | "fastest" | "best";

const sortOptions: { value: SortMode; label: string }[] = [
  { value: "cheapest", label: "Cheapest" },
  { value: "fastest", label: "Fastest" },
  { value: "best", label: "Recommended" },
];

export function ResultsDashboard({
  connections,
  fromStation,
  toStation,
}: ResultsDashboardProps) {
  const [activeTab, setActiveTab] = useState<SortMode>("cheapest");
  const [directOnly, setDirectOnly] = useState(false);
  const [selectedDay, setSelectedDay] = useState("Sat 24");

  const filteredConnections = connections
    .filter((connection) => (directOnly ? connection.transfers === 0 : true))
    .sort((a, b) => {
      if (activeTab === "cheapest") return a.price - b.price;
      if (activeTab === "fastest") {
        return durationInMinutes(a.duration) - durationInMinutes(b.duration);
      }
      return a.price + a.transfers * 15 - (b.price + b.transfers * 15);
    });

  return (
    <div className="w-full space-y-5">
      <DateStrip selectedDay={selectedDay} onSelect={setSelectedDay} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="px-1 text-[11px] font-medium text-muted">
          {filteredConnections.length}{" "}
          {filteredConnections.length === 1 ? "departure" : "departures"}
          <span className="sr-only">
            {" "}
            from {fromStation} to {toStation}
          </span>
        </p>

        <div className="flex items-center justify-between gap-2 sm:justify-end">
          <div
            role="group"
            aria-label="Sort connections"
            className="scrollbar-none flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto rounded-lg border border-hairline bg-surface p-1 sm:flex-none"
          >
            {sortOptions.map((option) => {
              const isActive = activeTab === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setActiveTab(option.value)}
                  aria-pressed={isActive}
                  className={`whitespace-nowrap rounded-md px-3 py-1.5 text-[11px] font-medium transition-colors duration-200 ${
                    isActive
                      ? "bg-ink text-canvas"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setDirectOnly((value) => !value)}
            aria-pressed={directOnly}
            className={`shrink-0 rounded-md border px-3.5 py-2 text-[11px] font-medium transition-colors duration-200 ${
              directOnly
                ? "border-ink bg-ink text-canvas"
                : "border-hairline bg-surface text-muted hover:border-ink/10 hover:text-ink"
            }`}
          >
            Direct only
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {filteredConnections.map((connection, index) => (
          <div
            key={connection.id}
            className="reveal"
            style={{ animationDelay: `${Math.min(index * 45, 180)}ms` }}
          >
            <ConnectionCard connection={connection} />
          </div>
        ))}

        {filteredConnections.length === 0 && (
          <div className="rounded-lg border border-hairline bg-surface px-6 py-14 text-center">
            <p className="text-[14px] font-medium text-ink">
              No direct connections found
            </p>
            <p className="mt-1.5 text-[11.5px] text-muted">
              Try allowing one transfer to see more departures.
            </p>
            <button
              type="button"
              onClick={() => setDirectOnly(false)}
              className="mt-5 inline-flex h-10 items-center justify-center rounded-md bg-brand px-5 text-[12px] font-semibold text-black transition-colors duration-200 hover:bg-brand-hover active:bg-brand-active"
            >
              Show all connections
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
