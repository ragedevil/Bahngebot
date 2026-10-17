"use client";

import React, { useState, useEffect } from "react";
import { SpecificRouteWidget } from "@/components/SpecificRouteWidget";
import { TinderMode } from "@/components/TinderMode";
import { ResultsDashboard } from "@/components/ResultsDashboard";
import { MOCK_CONNECTIONS } from "@/data/mockConnections";
import { Navigation, Flame, ArrowLeft } from "lucide-react";

export default function Home() {
  const [selectedMode, setSelectedMode] = useState<"specific" | "tinder" | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [connections] = useState(MOCK_CONNECTIONS);
  const [searchParams, setSearchParams] = useState({
    from: "Berlin Hbf",
    to: "München Hbf",
    date: "2026-10-24",
    passengers: 1,
  });

  // Typewriter effect state
  const fullText = "For those who didn’t win DiscoverEU — or just want to go again.";
  const [displayedText, setDisplayedText] = useState("");
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  useEffect(() => {
    let index = 0;
    setDisplayedText("");
    setIsTypingComplete(false);

    const timer = setInterval(() => {
      index++;
      if (index <= fullText.length) {
        setDisplayedText(fullText.slice(0, index));
      } else {
        setIsTypingComplete(true);
        clearInterval(timer);
      }
    }, 38);

    return () => clearInterval(timer);
  }, []);

  const handleSearch = (criteria: { from: string; to: string; date: string; passengers: number }) => {
    setSearchParams(criteria);
    setHasSearched(true);
  };

  const handleBackToModes = () => {
    setSelectedMode(null);
    setHasSearched(false);
  };

  return (
    <div className="relative min-h-screen bg-[#121214] text-[#FAFAFA] flex flex-col justify-between selection:bg-[#FF4458]/30 selection:text-white">
      {/* Background: Munich Central Station (München Hbf) photo at 30% opacity */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 transition-opacity duration-1000 scale-105"
          style={{
            // High-resolution photo of Munich Central Station (München Hauptbahnhof)
            backgroundImage: `url('https://images.unsplash.com/photo-1595867818082-083862f3d630?q=80&w=2600&auto=format&fit=crop')`,
          }}
        />
        {/* Lighter ambient glow & gradient overlay - no harsh borders */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#121214] via-[#121214]/75 to-[#121214]/60" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_10%,_#121214_90%)]" />
      </div>

      {/* Main Container */}
      <main className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 py-14 sm:py-24 flex flex-col items-center flex-1 justify-center">
        
        {/* Typewriter Title */}
        <div className="text-center mb-10 max-w-3xl mx-auto min-h-[110px] sm:min-h-[140px] flex items-center justify-center">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-[#FAFAFA] leading-[1.15]">
            {displayedText}
            {!isTypingComplete && (
              <span className="inline-block w-1 h-8 sm:h-12 bg-[#FF4458] ml-1.5 align-middle animate-pulse" />
            )}
          </h1>
        </div>

        {/* STEP 1: Mode Selection Cards (Lighter, no borders, clean Apple glass) */}
        {selectedMode === null ? (
          <div className="w-full max-w-xl mx-auto space-y-4">
            <div className="text-center text-sm font-medium text-zinc-300 uppercase tracking-wider mb-3">
              Select Your Travel Mode
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option 1: Specific Route */}
              <button
                onClick={() => setSelectedMode("specific")}
                className="group p-7 rounded-3xl bg-white/[0.08] hover:bg-white/[0.12] backdrop-blur-2xl transition-all duration-300 text-left flex flex-col justify-between hover:scale-[1.02] active:scale-[0.99] cursor-pointer shadow-xl shadow-black/20"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-[#FAFAFA] mb-5 group-hover:bg-[#2563EB] group-hover:text-white transition-colors">
                    <Navigation className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#FAFAFA] tracking-tight">
                    Specific Route
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-300 mt-2 leading-relaxed font-normal">
                    Search point-to-point connections with custom dates and stations.
                  </p>
                </div>

                <div className="mt-8 flex items-center text-sm font-medium text-white gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Enter Route</span>
                  <span className="text-zinc-400">→</span>
                </div>
              </button>

              {/* Option 2: Tinder Mode with Flame icon & Tinder Pink (#FF4458) */}
              <button
                onClick={() => setSelectedMode("tinder")}
                className="group p-7 rounded-3xl bg-[#FF4458]/[0.12] hover:bg-[#FF4458]/[0.18] backdrop-blur-2xl transition-all duration-300 text-left flex flex-col justify-between hover:scale-[1.02] active:scale-[0.99] cursor-pointer shadow-xl shadow-[#FF4458]/10"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#FF4458]/20 flex items-center justify-center text-[#FF4458] mb-5 group-hover:bg-[#FF4458] group-hover:text-white transition-colors">
                    <Flame className="w-6 h-6 fill-current" />
                  </div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-[#FAFAFA] tracking-tight">
                      Tinder Mode
                    </h3>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#FF4458]/20 text-[#FF4458]">
                      Explore
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-300 mt-2 leading-relaxed font-normal">
                    Input your departure city and budget, then swipe random train deals.
                  </p>
                </div>

                <div className="mt-8 flex items-center text-sm font-medium text-[#FF4458] gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Explore Tracks</span>
                  <span>→</span>
                </div>
              </button>
            </div>
          </div>
        ) : (
          /* STEP 2: Selected Mode View */
          <div className="w-full">
            {/* Top Bar Switcher (no borders) */}
            <div className="mb-6 flex items-center justify-between max-w-4xl mx-auto px-2">
              <button
                onClick={handleBackToModes}
                className="text-xs sm:text-sm text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer bg-white/[0.06] hover:bg-white/[0.1] px-3.5 py-1.5 rounded-full backdrop-blur-md"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Modes</span>
              </button>

              <div
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium backdrop-blur-md ${
                  selectedMode === "tinder"
                    ? "bg-[#FF4458]/20 text-[#FF4458]"
                    : "bg-white/[0.08] text-white"
                }`}
              >
                {selectedMode === "tinder" ? (
                  <>
                    <Flame className="w-3.5 h-3.5 fill-current" />
                    <span>Tinder Mode (Explore)</span>
                  </>
                ) : (
                  <>
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Specific Route Search</span>
                  </>
                )}
              </div>
            </div>

            {selectedMode === "specific" ? (
              <>
                <SpecificRouteWidget
                  initialFrom={searchParams.from}
                  initialTo={searchParams.to}
                  initialDate={searchParams.date}
                  onSearch={handleSearch}
                />

                {hasSearched && (
                  <div className="w-full mt-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <ResultsDashboard
                      connections={connections}
                      fromStation={searchParams.from}
                      toStation={searchParams.to}
                    />
                  </div>
                )}
              </>
            ) : (
              <TinderMode onBack={handleBackToModes} />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
