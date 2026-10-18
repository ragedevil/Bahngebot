"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Flame, X } from "lucide-react";
import { stashCriteria, type JourneyCriteria } from "@/lib/criteria";
import { TinderMode } from "./TinderMode";

interface TinderLaunchProps {
  criteria: JourneyCriteria;
  /** Label of the trigger button(s). */
  triggerLabel?: string;
  className?: string;
}

/**
 * "Tinder Mode" entry point.
 *
 * Clicking the trigger opens the budget & departure-station dialog on the
 * spot: no interstitial route, no second confirmation. Submitting it stashes
 * the origin and budget and navigates to the explorer already in the deck.
 *
 * A native <dialog> in modal mode gives focus trapping, Escape and the
 * inert backdrop for free; opening it is a synchronous showModal() call so
 * the first paint after the click is the dialog itself.
 */
export function TinderLaunch({
  criteria,
  triggerLabel = "Tinder Mode",
  className = "",
}: TinderLaunchProps) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  const handleComplete = (from: string, budget: number) => {
    const next: JourneyCriteria = { ...criteria, from };
    stashCriteria(next);
    // The deck is the destination — it reads `budget` straight from the URL.
    const params = new URLSearchParams({
      mode: "tinder",
      from: next.from,
      to: next.to,
      date: next.date,
      budget: String(budget),
    });
    router.push(`/explorer?${params.toString()}`);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`group inline-flex items-center gap-2.5 rounded-full border border-[#FE3C72]/50 bg-[#FE3C72]/10 px-4 py-2 text-white shadow-[0_0_20px_rgba(254,60,114,0.35)] transition-all duration-200 animate-tinder-glow hover:border-[#FE3C72] hover:shadow-[0_0_28px_rgba(254,60,114,0.55)] ${className}`}
      >
        <span className="flex items-center justify-center rounded-full bg-[#FE3C72]/20 p-1.5 text-[#FE3C72]">
          <Flame className="h-3.5 w-3.5 fill-current" strokeWidth={0} aria-hidden="true" />
        </span>

        <span className="text-sm font-medium text-white">{triggerLabel}</span>

        <span
          aria-hidden="true"
          className="text-sm text-[#FE3C72] transition-transform duration-200 group-hover:translate-x-0.5"
        >
          →
        </span>
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        onClose={() => setIsOpen(false)}
        // Clicking the dimmed backdrop (the dialog element itself) dismisses.
        onClick={(event) => {
          if (event.target === dialogRef.current) setIsOpen(false);
        }}
        className="m-auto w-[calc(100%-2rem)] max-w-lg bg-transparent p-0 text-zinc-100 backdrop:bg-black/70 backdrop:backdrop-blur-sm open:animate-none"
      >
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Close"
            className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-zinc-400 transition-colors hover:bg-white/[0.12] hover:text-white"
          >
            <X className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
          </button>

          {isOpen && (
            <TinderMode
              defaultFrom={criteria.from}
              defaultDate={criteria.date}
              onStart={handleComplete}
              headingId={titleId}
            />
          )}
        </div>
      </dialog>
    </>
  );
}
