"use client";

import React, { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { ModeSelector, type TravelMode } from "@/components/ModeSelector";
import { SpecificRouteWidget } from "@/components/SpecificRouteWidget";
import { ResultsDashboard } from "@/components/ResultsDashboard";
import { TinderMode } from "@/components/TinderMode";
import { MOCK_CONNECTIONS } from "@/data/mockConnections";

const formatRouteDate = (isoDate: string) => {
  const parsed = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(parsed);
};

export default function Home() {
  const [selectedMode, setSelectedMode] = useState<TravelMode | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [connections] = useState(MOCK_CONNECTIONS);
  const [searchParams, setSearchParams] = useState({
    from: "Berlin Hbf",
    to: "München Hbf",
    date: "2026-10-24",
    passengers: 1,
  });

  const handleSelectMode = (mode: TravelMode) => {
    setSelectedMode(mode);
    setHasSearched(mode === "specific");
  };

  const handleSearch = (criteria: {
    from: string;
    to: string;
    date: string;
    passengers: number;
  }) => {
    setSearchParams(criteria);
    setHasSearched(true);
    window.setTimeout(() => {
      document
        .getElementById("results")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  };

  const handleBackToModes = () => {
    setSelectedMode(null);
    setHasSearched(false);
  };

  return (
    <div className="flex min-h-dvh flex-col bg-canvas text-ink">
      <Navbar />

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-5 pb-16 sm:px-8">
        {selectedMode === null ? (
          <section className="flex flex-1 flex-col justify-center py-12 sm:py-20">
            <div className="reveal mx-auto mb-10 max-w-2xl text-center sm:mb-12">
              <h1 className="text-balance text-[44px] font-bold leading-[1.02] tracking-[-0.055em] text-ink sm:text-[62px]">
                Go further,{" "}
                <span className="text-muted">for less.</span>
              </h1>

              <p className="mx-auto mt-5 max-w-md text-balance text-[14.5px] leading-relaxed text-muted">
                Hidden Sparpreis fares, live from Deutsche Bahn. Pick a precise
                route — or let the right one find you.
              </p>
            </div>

            <div className="reveal reveal-delay-1 mx-auto w-full max-w-3xl">
              <ModeSelector onSelect={handleSelectMode} />
            </div>
          </section>
        ) : (
          <div className="w-full pt-5 sm:pt-7">
            {selectedMode === "specific" ? (
              <section className="reveal mx-auto w-full">
                <button
                  type="button"
                  onClick={handleBackToModes}
                  className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface px-3.5 py-2 text-[11.5px] font-medium text-muted transition-colors duration-200 hover:text-ink"
                >
                  <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.2} />
                  <span>Back</span>
                </button>

                <div className="mb-7 mt-6">
                  <h1 className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[27px] font-bold tracking-[-0.045em] text-ink sm:text-[34px]">
                    <span>{searchParams.from}</span>
                    <ArrowRight
                      className="h-4 w-4 text-muted sm:h-5 sm:w-5"
                      strokeWidth={2}
                    />
                    <span>{searchParams.to}</span>
                  </h1>
                  <p className="mt-2 text-[11.5px] font-normal text-muted">
                    {formatRouteDate(searchParams.date)}
                    <span className="mx-2 text-muted/50" aria-hidden="true">
                      —
                    </span>
                    {connections.length} connections
                  </p>
                </div>

                <SpecificRouteWidget
                  className="reveal reveal-delay-1"
                  initialFrom={searchParams.from}
                  initialTo={searchParams.to}
                  initialDate={searchParams.date}
                  onSearch={handleSearch}
                />

                {hasSearched && (
                  <div
                    id="results"
                    className="reveal reveal-delay-2 mt-8 scroll-mt-6"
                  >
                    <ResultsDashboard
                      connections={connections}
                      fromStation={searchParams.from}
                      toStation={searchParams.to}
                    />
                  </div>
                )}
              </section>
            ) : (
              <section className="mx-auto w-full">
                <button
                  type="button"
                  onClick={handleBackToModes}
                  className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface px-3.5 py-2 text-[11.5px] font-medium text-muted transition-colors duration-200 hover:text-ink"
                >
                  <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.2} />
                  <span>Back</span>
                </button>
                <div className="mt-8">
                  <TinderMode />
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      <footer className="mx-auto w-full max-w-5xl px-5 pb-6 sm:px-8">
        <div className="border-t border-hairline pt-5 text-[10px] font-normal text-muted">
          Independent fare discovery. Not affiliated with Deutsche Bahn.
        </div>
      </footer>
    </div>
  );
}
