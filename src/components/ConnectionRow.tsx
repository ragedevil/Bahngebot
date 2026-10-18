"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import { TrainConnection, type Leg } from "@/types/connection";

interface ConnectionRowProps {
  connection: TrainConnection;
  /** Tinted hairline + coral status accent when the deck is in Swipe Mode. */
  tone?: "emerald" | "coral";
  /** Called when the card's Select button is pressed. */
  onSelect?: (connection: TrainConnection) => void;
}

function formatTrain(leg: Leg) {
  const trainType = leg?.trainType ?? "ICE";
  const trainNumber = leg?.trainNumber ?? "Rail";
  const number = trainNumber
    .replace(new RegExp(`^${trainType}\\s*`, "i"), "")
    .trim();
  return `${trainType} ${number}`.trim();
}

function formatPrice(price: number) {
  const value = Number(price);
  return new Intl.NumberFormat("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
}

/** Normalise "4h 08m" → "4h 8min". */
function formatDuration(duration: string) {
  const raw = typeof duration === "string" ? duration : "";
  const hours = raw.match(/(\d+)\s*h/)?.[1];
  const minutes = raw.match(/(\d+)\s*m/)?.[1];
  const formatted = [hours && `${hours}h`, minutes && `${Number(minutes)}min`]
    .filter(Boolean)
    .join(" ");
  return formatted || "—";
}

function legsOf(connection: TrainConnection): Leg[] {
  if (Array.isArray(connection?.legs) && connection.legs.length > 0) {
    return connection.legs;
  }
  const trainTypes = Array.isArray(connection?.trainTypes)
    ? connection.trainTypes
    : [];
  return [
    {
      id: `${connection?.id ?? "conn"}-direct`,
      trainType: (trainTypes[0] as Leg["trainType"]) ?? "ICE",
      trainNumber: trainTypes[0] ?? "Rail",
      departureStation: connection?.departureStation ?? "",
      departureTime: connection?.departureTime ?? "",
      arrivalStation: connection?.arrivalStation ?? "",
      arrivalTime: connection?.arrivalTime ?? "",
      duration: connection?.duration ?? "",
    },
  ];
}

/**
 * The one train a card shows: the longest leg (the primary service).
 *
 * A connection is a journey with a single origin and a single final
 * destination; intermediate legs are only implied by the transfer count in
 * the header. Stacked per-leg bars would misrepresent that.
 */
function representativeLeg(connection: TrainConnection): Leg {
  const legs = legsOf(connection);
  const minutes = (duration: string) => {
    const raw = typeof duration === "string" ? duration : "";
    const hours = Number(raw.match(/(\d+)\s*h/)?.[1] ?? 0);
    const mins = Number(raw.match(/(\d+)\s*m/)?.[1] ?? 0);
    return hours * 60 + mins;
  };
  return legs.reduce((longest, leg) =>
    minutes(leg?.duration ?? "") > minutes(longest?.duration ?? "")
      ? leg
      : longest,
  );
}

/**
 * DB-style journey rectangle.
 *
 * Stretched full-width bar naming the primary train, then the connection's
 * own origin (left) and final destination (right) immediately below it — the
 * DB layout. Intermediate legs are only implied by the transfer count in the
 * header; stacked per-leg bars would misrepresent the journey.
 *
 * The bar is deliberately theme-independent: dark zinc with white type in
 * both light and dark mode, so it reads as the printed DB detail strip.
 */
function JourneyBar({
  connection,
  leg,
}: {
  connection: TrainConnection;
  leg: Leg;
}) {
  const code = formatTrain(leg);

  return (
    <div className="flex flex-col">
      <div
        title={code}
        className="journey-bar my-2 flex h-6 w-full items-center justify-center rounded-sm bg-zinc-800 text-white"
      >
        <span className="font-mono text-xs font-bold text-white">{code}</span>
      </div>

      <div className="flex items-start justify-between gap-4">
        <span className="min-w-0 text-left text-base font-medium leading-snug text-zinc-600 dark:text-zinc-400">
          {connection.departureStation}
        </span>
        <span className="min-w-0 text-right text-base font-medium leading-snug text-zinc-600 dark:text-zinc-400">
          {connection.arrivalStation}
        </span>
      </div>
    </div>
  );
}

const SHELL: Record<NonNullable<ConnectionRowProps["tone"]>, string> = {
  emerald:
    "border-zinc-300 dark:border-white/10 hover:border-zinc-400 dark:hover:border-white/[0.14] hover:shadow-[0_8px_32px_-16px_rgba(29,185,53,0.4)] dark:hover:shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.15),0_8px_32px_-16px_rgba(29,185,53,0.4)]",
  coral:
    "border-[#FE3C72]/30 dark:border-[#FE3C72]/25 hover:border-[#FE3C72]/50 dark:hover:border-[#FE3C72]/45 hover:shadow-[0_8px_32px_-16px_rgba(254,60,114,0.35)] dark:hover:shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.15),0_8px_32px_-16px_rgba(254,60,114,0.45)]",
};

const CTA: Record<NonNullable<ConnectionRowProps["tone"]>, string> = {
  emerald: "bg-[#1DB954] text-black hover:bg-[#1ed760]",
  coral: "bg-[#FE3C72] text-white hover:bg-[#ff5685]",
};

export function ConnectionRow({
  connection,
  tone = "emerald",
  onSelect,
}: ConnectionRowProps) {
  const primaryLeg = representativeLeg(connection);
  const price = formatPrice(connection.price);
  const duration = formatDuration(connection.duration);
  const transfers = Number.isFinite(Number(connection.transfers))
    ? Number(connection.transfers)
    : 0;

  return (
    <article
      className={`bar-glass rounded-xl border bg-white p-5 transition-all duration-200 dark:bg-[#141820] dark:shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.15)] sm:p-6 ${SHELL[tone]}`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
        <div className="flex items-baseline gap-3">
          <p className="text-lg font-bold tabular-nums text-zinc-900 md:text-xl dark:text-white">
            {connection.departureTime}
            <span className="mx-1.5 font-normal text-zinc-400 dark:text-zinc-500">—</span>
            {connection.arrivalTime}
          </p>
          <p className="text-sm tabular-nums text-zinc-500 dark:text-zinc-400">
            {duration}
            <span className="mx-1.5 font-sans text-zinc-400 dark:text-zinc-600">·</span>
            {transfers === 0
              ? "Direct"
              : `${transfers} change${transfers > 1 ? "s" : ""}`}
          </p>
        </div>

        <div className="flex items-center justify-between gap-6 sm:justify-end">
          <p className="whitespace-nowrap text-xl font-bold tabular-nums text-zinc-900 md:text-2xl dark:text-white">
            {price} €
          </p>

          <button
            type="button"
            onClick={() => onSelect?.(connection)}
            aria-label={`Select ${connection.departureTime} connection from ${connection.departureStation} to ${connection.arrivalStation} for ${price} euro`}
            className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.3)] transition-colors ${CTA[tone]}`}
          >
            Select
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="mt-5 border-t border-black/[0.06] pt-4 dark:border-white/[0.08]">
        <JourneyBar connection={connection} leg={primaryLeg} />
      </div>
    </article>
  );
}
