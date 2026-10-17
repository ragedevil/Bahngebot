"use client";

import React, { useState } from "react";
import { TrainConnection } from "@/types/connection";
import { ConnectionCard } from "./ConnectionCard";
import { CALENDAR_DEALS } from "@/data/mockConnections";

interface ResultsDashboardProps {
  connections: TrainConnection[];
  fromStation: string;
  toStation: string;
}

export function ResultsDashboard({ connections, fromStation, toStation }: ResultsDashboardProps) {
  const [activeTab, setActiveTab] = useState<"cheapest" | "fastest" | "best">("cheapest");
  const [maxTransfers, setMaxTransfers] = useState<number | "all">("all");
  const [selectedDay, setSelectedDay] = useState("Sat 24");

  const filteredConnections = connections
    .filter((c) => {
      if (maxTransfers === "all") return true;
      return c.transfers <= maxTransfers;
    })
    .sort((a, b) => {
      if (activeTab === "cheapest") return a.price - b.price;
      if (activeTab === "fastest") return parseInt(a.duration) - parseInt(b.duration);
      return (a.price + a.transfers * 15) - (b.price + b.transfers * 15);
    });

  const lowestPrice = Math.min(...connections.map(c => c.price));
  const fastestDuration = connections.reduce((min, c) => c.duration < min ? c.duration : min, "99h");

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
              {filteredConnections.length} verified Deutsche Bahn connections
            </p>
          </div>
        </div>

        {/* Date Matrix */}
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
          {CALENDAR_DEALS.map((deal) => {
            const isSelected = selectedDay === deal.day;
            return (
              <button
                key={deal.day}
                onClick={() => setSelectedDay(deal.day)}
                className={`py-2 px-1 rounded-xl text-center transition-colors border cursor-pointer ${
                  isSelected
                    ? "bg-[#2563EB] text-white border-[#2563EB] font-semibold shadow-md shadow-blue-500/20"
                    : deal.lowest
                    ? "bg-[#052E16] border-[#10B981]/40 text-[#10B981]"
                    : "bg-white/[0.03] border-white/5 text-zinc-400 hover:text-[#FAFAFA] hover:border-white/10"
                }`}
              >
                <div className={`text-[10px] ${isSelected ? "text-blue-100 font-medium" : "text-zinc-400"}`}>
                  {deal.day}
                </div>
                <div className="text-xs font-bold mt-0.5">
                  {deal.price}
                </div>
              </button>
            );
          })}
        </div>
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
            Cheapest · €{lowestPrice.toFixed(2)}
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
        {filteredConnections.map((conn) => (
          <ConnectionCard key={conn.id} connection={conn} />
        ))}
      </div>

    </div>
  );
}
