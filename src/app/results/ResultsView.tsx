"use client";

import React, { useReducer, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Flame } from "lucide-react";
import { AppFooter } from "@/components/AppFooter";
import { AppShell } from "@/components/AppShell";
import { ResultsDashboard } from "@/components/ResultsDashboard";
import { SpecificRouteWidget } from "@/components/SpecificRouteWidget";
import { TinderLaunch } from "@/components/TinderLaunch";
import { useRouteConnections } from "@/hooks/useRouteConnections";
import { stashCriteria, type JourneyCriteria } from "@/lib/criteria";
import type { TravelMode } from "@/types/travel";

const formatRouteDate = (isoDate: string) => {
  const parsed = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(parsed);
};

interface ResultsViewProps {
  criteria: JourneyCriteria;
  initialMode: TravelMode;
}

const GLASS =
  "bar-glass rounded-xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.15)]";

export function ResultsView({ criteria, initialMode }: ResultsViewProps) {
  const router = useRouter();
  // Mode is a URL concern only; there is no in-page switcher to change it.
  const activeMode: TravelMode = initialMode;
  const [selectedConnectionId, setSelectedConnectionId] = useState<
    string | null
  >(null);

  // Seed with the bundled connections so the feed is never blank on first
  // paint, then replace with the API payload — or the same fallback.
  // Bumped on every submit so re-running the same route refetches.
  const [refetchToken, bumpSearch] = useReducer((count: number) => count + 1, 0);
  const { connections, isLoading } = useRouteConnections(criteria, refetchToken);

  const applyRoute = (next: JourneyCriteria) => {
    stashCriteria(next);
    setSelectedConnectionId(null);
    bumpSearch();
    const params = new URLSearchParams({
      mode: activeMode,
      from: next.from,
      to: next.to,
      date: next.date,
    });
    router.replace(`/results?${params.toString()}`, { scroll: false });
  };

  return (
    <AppShell mode={activeMode}>
      <main className="mx-auto w-full max-w-3xl flex-1 overflow-x-hidden px-5 pb-16 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-4 pt-[calc(env(safe-area-inset-top)+4.25rem)] sm:pt-[calc(env(safe-area-inset-top)+4.5rem)]">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden="true" />
            New search
          </Link>
        </div>

        <div className="mb-7 mt-7">
          <span
            className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${
              activeMode === "tinder"
                ? "border-[#FE3C72]/40 bg-[#FE3C72]/10 text-[#FE3C72]"
                : "border-[#1DB954]/35 bg-[#1DB954]/10 text-[#1DB954]"
            }`}
          >
            {activeMode === "tinder" ? (
              <Flame className="h-3 w-3 fill-current" strokeWidth={0} aria-hidden="true" />
            ) : (
              <span
                className="h-1.5 w-1.5 rounded-full bg-[#1DB954]"
                aria-hidden="true"
              />
            )}
            {activeMode === "tinder" ? "Tinder Mode" : "Specific Route"}
          </span>

          <h1 className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            <span>{criteria.from}</span>
            <ArrowRight
              className="h-4 w-4 text-zinc-500"
              strokeWidth={2}
              aria-hidden="true"
            />
            <span>{criteria.to}</span>
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            {formatRouteDate(criteria.date)}
          </p>
        </div>

        {activeMode === "specific" ? (
          <>
            <SpecificRouteWidget
              key={`${criteria.from}|${criteria.to}|${criteria.date}`}
              initialFrom={criteria.from}
              initialTo={criteria.to}
              initialDate={criteria.date}
              onSearch={applyRoute}
            />

            <div className="mt-8">
              <ResultsDashboard
                mode="specific"
                connections={connections}
                fromStation={criteria.from}
                toStation={criteria.to}
                isLoading={isLoading}
                selectedId={selectedConnectionId}
                onSelectConnection={(connection) =>
                  setSelectedConnectionId(connection.id)
                }
              />
            </div>
          </>
        ) : (
          <div className={`${GLASS} p-6 sm:p-8`}>
            <p className="text-sm leading-relaxed text-zinc-400">
              Swipe through Sparpreis fares from{" "}
              <span className="font-medium text-white">{criteria.from}</span>.
              Set your budget and you are on the cards — no extra steps.
            </p>
            <div className="mt-5">
              <TinderLaunch
                criteria={criteria}
                triggerLabel="Open swipe deck"
                className="rounded-lg px-3.5 py-1.5"
              />
            </div>
            <div className="mt-8">
              <ResultsDashboard
                mode="tinder"
                connections={connections.slice(0, 3)}
                fromStation={criteria.from}
                toStation={criteria.to}
                isLoading={isLoading}
                selectedId={selectedConnectionId}
                onSelectConnection={(connection) =>
                  setSelectedConnectionId(connection.id)
                }
              />
            </div>
          </div>
        )}
      </main>

      <AppFooter />
    </AppShell>
  );
}
