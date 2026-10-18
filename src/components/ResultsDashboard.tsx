"use client";

import React from "react";
import { TrainConnection } from "@/types/connection";
import type { TravelMode } from "@/types/travel";
import { ConnectionRow } from "./ConnectionRow";
import { DateStrip } from "./DateStrip";

interface ResultsDashboardProps {
  connections: TrainConnection[];
  fromStation: string;
  toStation: string;
  mode?: TravelMode;
  selectedId?: string | null;
  onSelectConnection?: (connection: TrainConnection) => void;
  /** Shown in place of the list while a search is in flight. */
  isLoading?: boolean;
}

const durationInMinutes = (duration: string) => {
  const hours = Number(duration.match(/(\d+)\s*h/)?.[1] ?? 0);
  const minutes = Number(duration.match(/(\d+)\s*m/)?.[1] ?? 0);
  return hours * 60 + minutes;
};

const priceOf = (connection: TrainConnection) => {
  const price = Number(connection?.price);
  return Number.isFinite(price) ? price : Number.POSITIVE_INFINITY;
};

const transfersOf = (connection: TrainConnection) => {
  const transfers = Number(connection?.transfers);
  return Number.isFinite(transfers) ? transfers : 0;
};

type SortMode = "cheapest" | "fastest" | "best";

const sortOptions: { value: SortMode; label: string }[] = [
  { value: "cheapest", label: "Cheapest" },
  { value: "fastest", label: "Fastest" },
  { value: "best", label: "Recommended" },
];

const GLASS =
  "bar-glass rounded-xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.15)]";

/**
 * Keeps a single malformed card from unmounting the whole results feed: if a
 * row throws while rendering, only that row degrades to a message.
 */
class ConnectionBoundary extends React.Component<
  { label: string; children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("ConnectionCard render failed", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <p className={`${GLASS} p-6 text-sm text-zinc-600 dark:text-zinc-400`}>
          This connection could not be displayed.
        </p>
      );
    }
    return this.props.children;
  }
}

export function ResultsDashboard({
  connections,
  fromStation,
  toStation,
  mode = "specific",
  selectedId,
  onSelectConnection,
  isLoading = false,
}: ResultsDashboardProps) {
  const [activeSort, setActiveSort] = React.useState<SortMode>("cheapest");
  const [directOnly, setDirectOnly] = React.useState(false);
  const [selectedDay, setSelectedDay] = React.useState("Sat 24");
  const isSwipe = mode === "tinder";

  const safeConnections = Array.isArray(connections) ? connections : [];

  const sortedConnections = safeConnections
    .filter((connection) => Boolean(connection && connection.id))
    .filter((connection) =>
      directOnly ? transfersOf(connection) === 0 : true,
    )
    .sort((a, b) => {
      if (activeSort === "cheapest") return priceOf(a) - priceOf(b);
      if (activeSort === "fastest") {
        return (
          durationInMinutes(a.duration ?? "") -
          durationInMinutes(b.duration ?? "")
        );
      }
      return (
        priceOf(a) + transfersOf(a) * 15 - (priceOf(b) + transfersOf(b) * 15)
      );
    });

  return (
    <section aria-label={`Connections from ${fromStation} to ${toStation}`}>
      <DateStrip
        selectedDay={selectedDay}
        onSelect={setSelectedDay}
        mode={mode}
      />

      <div
        className={`mb-4 mt-6 flex flex-wrap items-center gap-4 px-3 py-2 ${GLASS} ${
          isSwipe ? "border-[#FE3C72]/20" : ""
        }`}
      >
        {sortOptions.map((option) => {
          const isActive = activeSort === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setActiveSort(option.value)}
              aria-pressed={isActive}
              className={`text-sm font-medium transition-colors ${
                isActive
                  ? "text-zinc-900 dark:text-white"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
              }`}
            >
              {option.label}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => setDirectOnly((value) => !value)}
          aria-pressed={directOnly}
          className={`ml-auto rounded-md px-2.5 py-1 text-sm font-medium transition-colors ${
            directOnly
              ? "bg-zinc-900 text-white dark:bg-white/[0.08] dark:text-white"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
          }`}
        >
          Direct only
        </button>
      </div>

      <div className="relative z-10 mx-auto mt-6 flex w-full max-w-4xl flex-col gap-3">
        {sortedConnections.map((connection, index) => (
          <div
            key={`${connection.id}-${index}`}
            className={
              selectedId === connection.id
                ? `rounded-xl ring-1 ${
                    isSwipe
                      ? "ring-[#FE3C72]/60"
                      : "ring-[#1DB954]/60"
                  }`
                : undefined
            }
          >
            <ConnectionBoundary label={connection.id || `row ${index + 1}`}>
              <ConnectionRow
                connection={connection}
                tone={isSwipe ? "coral" : "emerald"}
                onSelect={onSelectConnection}
              />
            </ConnectionBoundary>
          </div>
        ))}

        {isLoading && sortedConnections.length === 0 && (
          <p
            role="status"
            className={`${GLASS} p-6 text-sm text-zinc-600 dark:text-zinc-400`}
          >
            Finding connections…
          </p>
        )}

        {!isLoading && sortedConnections.length === 0 && (
          <p className={`${GLASS} p-6 text-sm text-zinc-600 dark:text-zinc-400`}>
            {directOnly
              ? "No direct connections on this date."
              : "No connections on this date."}
          </p>
        )}
      </div>
    </section>
  );
}
