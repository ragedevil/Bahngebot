"use client";

import React, { useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { RailMapBackdrop } from "@/components/RailMapBackdrop";
import { Navbar } from "@/components/Navbar";
import { SpecificRouteWidget } from "@/components/SpecificRouteWidget";
import { TinderPillOffer } from "@/components/TinderPillOffer";
import {
  stashCriteria,
  readCriteriaSnapshot,
  readServerCriteria,
  subscribeCriteria,
  type JourneyCriteria,
} from "@/lib/criteria";
import type { TravelMode } from "@/types/travel";

const DEFAULTS: JourneyCriteria = {
  from: "Berlin Hbf",
  to: "München Hbf",
  date: "2026-10-24",
  passengers: 1,
};

export default function Home() {
  const router = useRouter();
  // The landing page is Route Mode in search state: emerald glow, green CTA.
  const mode: TravelMode = "specific";

  // Browser-only read of the last search, hydration-safe by construction:
  // the server snapshot is always null so prerendered markup stays static.
  const stashed = useSyncExternalStore(
    subscribeCriteria,
    readCriteriaSnapshot,
    readServerCriteria,
  );
  const criteria: JourneyCriteria = {
    from: stashed?.from ?? DEFAULTS.from,
    to: stashed?.to ?? DEFAULTS.to,
    date: stashed?.date ?? DEFAULTS.date,
    passengers: 1,
  };

  const handleSearch = (next: JourneyCriteria) => {
    stashCriteria(next);
    const params = new URLSearchParams({
      mode,
      from: next.from,
      to: next.to,
      date: next.date,
    });
    router.push(`/results?${params.toString()}`);
  };

  return (
    <div className="relative z-10 flex min-h-dvh flex-col overflow-x-hidden bg-canvas">
      <RailMapBackdrop mode={mode} glow />
      <Navbar />

      <div className="relative flex min-h-dvh flex-1 flex-col">
        <main className="flex flex-1 flex-col items-center justify-center px-5 py-24 pt-[calc(env(safe-area-inset-top)+7rem)] sm:px-8">
          <section className="w-full max-w-4xl text-center">
            <h1 className="text-balance text-3xl font-bold tracking-tight text-white md:text-5xl">
              For those who missed DiscoverEU
            </h1>
            <span className="mt-2 block text-base font-normal text-zinc-400 md:text-xl">
              (or those wanting to repeat it).
            </span>

            <div className="mt-10 sm:mt-12">
              <SpecificRouteWidget
                className="mx-auto max-w-4xl"
                initialFrom={criteria.from}
                initialTo={criteria.to}
                initialDate={criteria.date}
                onSearch={handleSearch}
              />
            </div>

            {/* Secondary offer: one quiet chip under the dock, not a banner. */}
            <div className="mt-4 flex justify-center sm:mt-5">
              <TinderPillOffer criteria={criteria} />
            </div>
          </section>
        </main>

        <footer className="px-5 pb-6 sm:px-8">
          <p className="mx-auto max-w-5xl border-t border-white/[0.06] pt-5 text-center text-xs text-zinc-500 sm:text-left">
            Independent fare discovery. Not affiliated with Deutsche Bahn.
          </p>
        </footer>
      </div>
    </div>
  );
}
