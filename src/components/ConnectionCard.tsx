"use client";

import React, { useState } from "react";
import { TrainConnection } from "@/types/connection";
import { ChevronDown, ChevronUp, AlertCircle } from "lucide-react";

interface ConnectionCardProps {
  connection: TrainConnection;
}

export function ConnectionCard({ connection }: ConnectionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="rounded-2xl bg-[#09090B]/90 border border-white/10 hover:border-[#2563EB]/40 transition-colors overflow-hidden">
      <div className="p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          
          {/* Main Info */}
          <div className="flex-1 space-y-3">
            
            {/* Meta Tags */}
            <div className="flex items-center gap-2">
              {connection.dealTag && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[#052E16] text-[#10B981] border border-[#10B981]/30">
                  {connection.dealTag}
                </span>
              )}
              {connection.trainTypes.map((t, idx) => (
                <span key={idx} className="text-[11px] font-mono text-zinc-400">
                  {t}
                </span>
              ))}
              <span className="text-[11px] text-zinc-500 ml-auto md:ml-2">
                {connection.transfers === 0 ? "Direct" : `${connection.transfers} transfer`}
              </span>
            </div>

            {/* Timings */}
            <div className="flex items-baseline justify-between max-w-lg">
              <div>
                <div className="text-2xl font-semibold tracking-tight text-[#FAFAFA]">
                  {connection.departureTime}
                </div>
                <div className="text-xs text-zinc-400 mt-0.5">
                  {connection.departureStation}
                </div>
              </div>

              <div className="flex flex-col items-center px-4">
                <span className="text-[11px] text-zinc-500 font-mono mb-1">
                  {connection.duration}
                </span>
                <div className="w-24 sm:w-32 h-[1px] bg-white/10 relative flex items-center justify-between">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#FAFAFA]" />
                  {connection.transfers > 0 && <div className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />}
                  <div className="w-1.5 h-1.5 rounded-full bg-[#FAFAFA]" />
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-semibold tracking-tight text-[#FAFAFA]">
                  {connection.arrivalTime}
                </div>
                <div className="text-xs text-zinc-400 mt-0.5">
                  {connection.arrivalStation}
                </div>
              </div>
            </div>

          </div>

          {/* Price & Action */}
          <div className="flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6 min-w-[130px]">
            <div className="text-left md:text-right">
              {connection.originalPrice && (
                <div className="text-[11px] text-zinc-500 line-through">
                  €{connection.originalPrice.toFixed(2)}
                </div>
              )}
              <div className="text-2xl font-bold tracking-tight text-[#10B981]">
                €{connection.price.toFixed(2)}
              </div>
              <div className="text-[10px] text-[#F59E0B] font-medium">
                Sparpreis Europa
              </div>
            </div>

            <div className="mt-2">
              <a
                href="https://www.bahn.de"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-600 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
              >
                Select
              </a>
            </div>
          </div>

        </div>

        {/* Expand Toggle */}
        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-500">
          <span className="flex items-center gap-1.5 text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
            Official DB quota verified
          </span>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 hover:text-[#FAFAFA] transition-colors cursor-pointer"
          >
            <span>{isExpanded ? "Hide itinerary" : "Show itinerary"}</span>
            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {/* Detail Accordion */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-white/10 space-y-4">
            <div className="space-y-3 pl-3 border-l border-white/10 ml-1">
              {connection.legs.map((leg) => (
                <div key={leg.id} className="text-xs space-y-1">
                  <div className="flex items-center justify-between text-[#FAFAFA] font-medium">
                    <span>{leg.departureTime} — {leg.departureStation}</span>
                    {leg.platform && <span className="text-zinc-500 text-[11px] font-mono">{leg.platform}</span>}
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    {leg.trainType} {leg.trainNumber} · {leg.duration}
                  </div>
                  <div className="flex items-center justify-between text-[#FAFAFA] font-medium">
                    <span>{leg.arrivalTime} — {leg.arrivalStation}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
