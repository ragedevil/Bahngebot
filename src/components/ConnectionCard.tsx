"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import { TrainConnection } from "@/types/connection";

interface ConnectionCardProps {
  connection: TrainConnection;
}

function formatTrain(connection: TrainConnection) {
  const leg = connection.legs[0];
  if (!leg) return "Rail";

  const number = leg.trainNumber
    .replace(new RegExp(`^${leg.trainType}\\s*`, "i"), "")
    .trim();

  return `${leg.trainType} ${number}`;
}

function formatTransfers(transfers: number) {
  if (transfers === 0) return "Direct";
  return `${transfers} transfer${transfers > 1 ? "s" : ""}`;
}

function formatStops(transfers: number) {
  if (transfers === 0) return "Direct";
  return `${transfers} stop${transfers > 1 ? "s" : ""}`;
}

export function ConnectionCard({ connection }: ConnectionCardProps) {
  const train = formatTrain(connection);
  const transferLabel = formatTransfers(connection.transfers);
  const statusLabel = formatStops(connection.transfers);

  return (
    <article className="connection-row group rounded-lg">
      <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_140px_auto] lg:items-center lg:gap-6">
        {/* Zone 1 — journey */}
        <div className="flex items-center gap-3 sm:gap-5">
          <div className="min-w-[68px] shrink-0">
            <div className="text-xl font-semibold leading-none tracking-[-0.04em] text-ink tabular-nums">
              {connection.departureTime}
            </div>
            <div className="mt-2 max-w-[120px] truncate text-[11.5px] font-normal leading-none text-muted">
              {connection.departureStation}
            </div>
          </div>

          <div className="flex min-w-0 flex-1 flex-col justify-center">
            <p className="mb-2.5 truncate text-center text-[10px] font-medium leading-none text-muted tabular-nums">
              {connection.duration}
              <span className="mx-1.5 text-muted/50" aria-hidden="true">
                ·
              </span>
              {train}
              <span className="mx-1.5 text-muted/50" aria-hidden="true">
                ·
              </span>
              {transferLabel}
            </p>

            <div
              className="relative h-px w-full bg-ink/10"
              aria-hidden="true"
            >
              <span className="absolute left-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-muted/50" />
              {Array.from({ length: connection.transfers }).map((_, index) => (
                <span
                  key={index}
                  className="absolute top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-muted/45"
                  style={{
                    left: `${((index + 1) / (connection.transfers + 1)) * 100}%`,
                  }}
                />
              ))}
              <span className="absolute right-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-muted/50" />
            </div>
          </div>

          <div className="min-w-[68px] shrink-0 text-right">
            <div className="text-xl font-semibold leading-none tracking-[-0.04em] text-ink tabular-nums">
              {connection.arrivalTime}
            </div>
            <div className="ml-auto mt-2 max-w-[120px] truncate text-[11.5px] font-normal leading-none text-muted">
              {connection.arrivalStation}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-hairline pt-4 lg:contents lg:border-0 lg:pt-0">
          {/* Zone 2 — status */}
          <div className="flex shrink-0 items-center gap-2 text-[11.5px] font-medium text-muted lg:border-l lg:border-hairline lg:pl-6">
            <span className="h-1.5 w-1.5 rounded-full bg-[#1DB954]" aria-hidden="true" />
            <span>{statusLabel}</span>
          </div>

          {/* Zone 3 — price and action */}
          <div className="flex shrink-0 items-center gap-4 lg:justify-end">
            <span className="text-2xl font-bold leading-none tracking-tight text-ink tabular-nums">
              €{connection.price.toFixed(2)}
            </span>
            <a
              href="https://www.bahn.de"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Select connection departing ${connection.departureTime} from ${connection.departureStation} at €${connection.price.toFixed(2)}`}
              className="inline-flex items-center justify-center gap-1.5 rounded-md bg-brand px-5 py-2.5 text-[12.5px] font-semibold text-black transition-colors duration-200 hover:bg-brand-hover active:bg-brand-active"
            >
              <span>Select</span>
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.2} aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
