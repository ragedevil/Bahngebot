"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Flame } from "lucide-react";
import { AppFooter } from "@/components/AppFooter";
import { AppShell } from "@/components/AppShell";
import { TinderMode } from "@/components/TinderMode";
import { stashCriteria, type JourneyCriteria } from "@/lib/criteria";

interface ExplorerViewProps {
  criteria: JourneyCriteria;
  /** Budget chosen in the entry dialog; the deck opens straight on it. */
  budget: number;
}

/**
 * Connection Explorer: the full swipe deck on a Tinder-lit canvas.
 * The photo is deliberately absent — only the ambient coral glow here.
 */
export function ExplorerView({ criteria, budget }: ExplorerViewProps) {
  const backToResults = `/results?${new URLSearchParams({
    mode: "specific",
    from: criteria.from,
    to: criteria.to,
    date: criteria.date,
  }).toString()}`;

  return (
    <AppShell mode="tinder">
      <main className="mx-auto w-full max-w-3xl flex-1 overflow-x-hidden px-5 pb-16 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3 pt-[calc(env(safe-area-inset-top)+4.5rem)]">
          <Link
            href={backToResults}
            onClick={() => stashCriteria(criteria)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden="true" />
            Edit route
          </Link>

          <span className="inline-flex items-center gap-1.5 rounded-md border border-[#FE3C72]/40 bg-[#FE3C72]/10 px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-[#FE3C72] shadow-[0_0_24px_rgba(254,60,114,0.18)]">
            <Flame className="h-3 w-3 fill-current" strokeWidth={0} aria-hidden="true" />
            Connection explorer
          </span>
        </div>

        <div className="mb-8 mt-7 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Let the route find you.
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-zinc-400">
            Swipe through handpicked Sparpreis deals departing from{" "}
            <span className="font-medium text-white">{criteria.from}</span>.
          </p>
        </div>

        <TinderMode
          defaultFrom={criteria.from}
          defaultDate={criteria.date}
          defaultBudget={budget}
          startInDeck
        />

        <p className="mt-8 text-center text-xs text-zinc-500">
          Prefer a fixed pair of stations?{" "}
          <Link
            href={backToResults}
            className="font-medium text-[#1DB954] underline-offset-4 transition-colors hover:text-[#1ed760] hover:underline"
          >
            Search a specific route
          </Link>
        </p>
      </main>

      <AppFooter />
    </AppShell>
  );
}
