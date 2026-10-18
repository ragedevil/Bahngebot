"use client";

import React, { useState } from "react";
import {
  X,
  Heart,
  RotateCcw,
  ArrowRight,
  Calendar,
  MapPin,
  ArrowLeft,
  Flame,
} from "lucide-react";
import { StationInput } from "./StationInput";

interface TrainDeal {
  id: string;
  from: string;
  destination: string;
  price: number;
  originalPrice: number;
  duration: string;
  trainType: string;
  image: string;
  highlight: string;
  departureTime: string;
}

const DEALS_DATABASE: Record<string, TrainDeal[]> = {
  default: [
    {
      id: "deal-1",
      from: "Berlin Hbf",
      destination: "München Hbf",
      price: 17.5,
      originalPrice: 79.9,
      duration: "3h 54m",
      trainType: "ICE Sprinter",
      departureTime: "07:28",
      highlight: "Direct high-speed corridor straight into Bavaria.",
      image:
        "https://images.unsplash.com/photo-1595867818082-083862f3d630?q=80&w=1200&auto=format&fit=crop",
    },
    {
      id: "deal-2",
      from: "Berlin Hbf",
      destination: "Wien Hbf",
      price: 24.9,
      originalPrice: 89.0,
      duration: "7h 10m",
      trainType: "ICE / Railjet",
      departureTime: "08:15",
      highlight: "Scenic cross-border route to Austrian coffee houses.",
      image:
        "https://images.unsplash.com/photo-1516550893923-42d28e5677af?q=80&w=1200&auto=format&fit=crop",
    },
    {
      id: "deal-3",
      from: "Berlin Hbf",
      destination: "Amsterdam Centraal",
      price: 27.9,
      originalPrice: 95.0,
      duration: "5h 48m",
      trainType: "IC International",
      departureTime: "09:34",
      highlight: "Direct train across Dutch countryside to the canals.",
      image:
        "https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?q=80&w=1200&auto=format&fit=crop",
    },
    {
      id: "deal-4",
      from: "Berlin Hbf",
      destination: "Hamburg Hbf",
      price: 14.9,
      originalPrice: 49.0,
      duration: "1h 45m",
      trainType: "ICE",
      departureTime: "10:04",
      highlight: "Sub-2-hour blast to the Elbphilharmonie and harbor.",
      image:
        "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?q=80&w=1200&auto=format&fit=crop",
    },
    {
      id: "deal-5",
      from: "Berlin Hbf",
      destination: "Köln Hbf",
      price: 19.9,
      originalPrice: 74.0,
      duration: "4h 12m",
      trainType: "ICE",
      departureTime: "11:28",
      highlight: "World-famous Cathedral right outside the platform gate.",
      image:
        "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=1200&auto=format&fit=crop",
    },
    {
      id: "deal-6",
      from: "Berlin Hbf",
      destination: "Zürich HB",
      price: 34.9,
      originalPrice: 119.0,
      duration: "8h 20m",
      trainType: "ICE Nightjet",
      departureTime: "20:45",
      highlight: "Alpine getaway with scenic lake and mountain views.",
      image:
        "https://images.unsplash.com/photo-1515488764276-beab7607c1e6?q=80&w=1200&auto=format&fit=crop",
    },
  ],
};

type Perspective = "curated" | "surprise";

/** ISO date → "24.10.2026", independent of the browser locale. */
function formatDateDisplay(isoDate: string) {
  const [year, month, day] = isoDate.split("-");
  return year && month && day ? `${day}.${month}.${year}` : isoDate;
}

const BUDGET_MIN = 15;
const BUDGET_MAX = 60;

interface TinderModeProps {
  /** Seeded from the route criteria so the explorer stays in context. */
  defaultFrom?: string;
  defaultDate?: string;
  /** Budget picked in the entry dialog; the deck opens on it directly. */
  defaultBudget?: number;
  /**
   * When true the swipe deck is the first thing rendered — the budget dialog
   * is never shown, so entering from the landing CTA lands on the cards.
   */
  startInDeck?: boolean;
  /**
   * When provided, submitting the dialog hands the chosen station and budget
   * to the caller instead of flipping this component into the deck.
   */
  onStart?: (from: string, budget: number) => void;
  /** Overrides the heading id so a modal can label itself with it. */
  headingId?: string;
}

export function TinderMode({
  defaultFrom = "Berlin Hbf",
  defaultDate = "2026-10-24",
  defaultBudget = 30,
  startInDeck = false,
  onStart,
  headingId = "tinder-setup-title",
}: TinderModeProps = {}) {
  const [from, setFrom] = useState(defaultFrom);
  const [budget, setBudget] = useState<number>(defaultBudget);
  const [date, setDate] = useState(defaultDate);
  const [perspective, setPerspective] = useState<Perspective>("curated");
  const [hasStartedSwiping, setHasStartedSwiping] = useState(startInDeck);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [savedDeals, setSavedDeals] = useState<TrainDeal[]>([]);
  const [lastAction, setLastAction] = useState<"pass" | "like" | null>(null);

  const filteredDeals = DEALS_DATABASE.default.filter((d) => d.price <= budget);
  const activeDeal = filteredDeals[currentIndex];
  const roleLabel =
    perspective === "curated" ? "Your shortlist" : "Pure serendipity";
  const budgetProgress =
    ((budget - BUDGET_MIN) / (BUDGET_MAX - BUDGET_MIN)) * 100;

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (onStart) {
      onStart(from, budget);
      return;
    }
    setCurrentIndex(0);
    setSavedDeals([]);
    setHasStartedSwiping(true);
  };

  const handleSwipe = (direction: "left" | "right") => {
    if (!activeDeal) return;
    setLastAction(direction === "left" ? "pass" : "like");
    if (direction === "right") {
      setSavedDeals((prev) => [...prev, activeDeal]);
    }
    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setLastAction(null);
    }, 200);
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setSavedDeals([]);
  };

  /** Back from the deck goes straight into the dialog — one screen, not two. */
  const openSetup = () => setHasStartedSwiping(false);

  /* ---------------------------------------------------------------- */
  /* Step 1 — budget & departure station dialog                       */
  /* ---------------------------------------------------------------- */
  if (!hasStartedSwiping) {
    return (
      <div className="mx-auto w-full max-w-lg">
        <form
          onSubmit={handleStart}
          aria-labelledby={headingId}
          className="rounded-xl border border-[#FE3C72]/25 bg-white/[0.04] p-6 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.15),0_0_40px_-20px_rgba(254,60,114,0.6)] backdrop-blur-xl"
        >
          <div className="flex items-center justify-between gap-4">
            <span className="text-[11px] font-medium text-zinc-500">
              Swipe setup
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-md border border-[#FE3C72]/30 bg-[#FE3C72]/10 px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-[#FE3C72]">
              <Flame className="h-3 w-3 fill-current" strokeWidth={0} />
              Tinder mode
            </span>
          </div>

          <div className="mt-6">
            <h2
              id={headingId}
              className="text-[25px] font-extrabold leading-tight tracking-[-0.045em] text-white sm:text-[28px]"
            >
              Let the route find you.
            </h2>
            <p className="mt-2 max-w-[40ch] text-[13px] leading-relaxed text-gray-400">
              Set your departure city and budget. We&apos;ll deal the hidden
              Sparpreis fares.
            </p>
          </div>

          <div className="mt-6 space-y-5">
            {/* Starting station, with live autocomplete. */}
            <div className="space-y-2">
              <label htmlFor="departure-station" className="block text-[11px] font-medium text-zinc-500">
                Starting station
              </label>
              <div className="flex items-center gap-3 rounded-lg border border-white/[0.08] bg-white/[0.035] px-3.5 py-3 transition-colors duration-200 focus-within:border-white/15">
                <MapPin className="h-4 w-4 shrink-0 text-gray-400" strokeWidth={2} />
                <StationInput
                  id="departure-station"
                  required
                  value={from}
                  onChange={setFrom}
                  placeholder="e.g. Berlin Hbf"
                  inputClassName="w-full min-w-0 bg-transparent text-[13.5px] font-semibold text-white placeholder:text-gray-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Budget slider */}
            <div>
              <div className="flex items-center justify-between gap-3">
                <label htmlFor="budget-range" className="block text-[11px] font-medium text-zinc-500">
                  Maximum budget
                </label>
                <span className="flex items-baseline gap-1">
                  <span className="text-[21px] font-extrabold leading-none tracking-[-0.04em] text-white tabular-nums">
                    €{budget}
                  </span>
                  <span className="font-sans text-[10.5px] font-medium text-gray-500">
                    / connection
                  </span>
                </span>
              </div>

              <div className="mt-2">
                <input
                  id="budget-range"
                  type="range"
                  min={BUDGET_MIN}
                  max={BUDGET_MAX}
                  step={5}
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  aria-valuetext={`Up to €${budget} per connection`}
                  className="range-ios"
                  style={
                    {
                      "--range-progress": `${budgetProgress}%`,
                    } as React.CSSProperties
                  }
                />

                <div className="relative mt-1 h-4 text-[10.5px] font-semibold">
                  <span className="absolute left-0 top-0 text-gray-500">€15</span>
                  <span className="absolute left-1/3 top-0 -translate-x-1/2 whitespace-nowrap text-[#FE3C72]">
                    €30 <span className="font-normal text-gray-500">Sparpreis</span>
                  </span>
                  <span className="absolute right-0 top-0 text-gray-500">€60+</span>
                </div>
              </div>
            </div>

            {/* Date & role */}
            <div className="grid gap-4 sm:grid-cols-2 sm:gap-3">
              <div className="space-y-2">
                <label htmlFor="departure-date" className="block text-[11px] font-medium text-zinc-500">
                  Departure date
                </label>
                <div className="flex items-center gap-2.5 rounded-lg border border-white/[0.08] bg-white/[0.035] px-3.5 py-3 transition-colors duration-200 focus-within:border-white/15">
                  <Calendar className="h-4 w-4 shrink-0 text-gray-400" strokeWidth={2} />
                  <input
                    id="departure-date"
                    type="date"
                    value={date}
                    data-display={formatDateDisplay(date)}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full cursor-pointer bg-transparent text-[12.5px] font-semibold text-white tabular-nums focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <span className="block text-[11px] font-medium text-zinc-500">Swipe style</span>
                <div
                  role="group"
                  aria-label="Swipe style"
                  className="flex rounded-lg border border-white/[0.08] bg-white/[0.035] p-1"
                >
                  {(
                    [
                      ["curated", "I'll choose"],
                      ["surprise", "Surprise me"],
                    ] as const
                  ).map(([value, label]) => {
                    const isActive = perspective === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setPerspective(value)}
                        aria-pressed={isActive}
                        className={`flex-1 rounded-md px-2 py-1.5 text-[11.5px] font-bold transition-all duration-200 active:scale-[0.98] ${
                          isActive
                            ? "bg-[#FE3C72] text-white"
                            : "text-gray-400 hover:bg-white/[0.05] hover:text-white"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white py-3.5 text-[13px] font-bold text-[#080b10] transition-all duration-200 hover:border-[#FE3C72] hover:bg-[#FE3C72] hover:text-white active:scale-[0.99]"
          >
            <Flame className="h-4 w-4" strokeWidth={2.2} />
            <span>Start swiping tracks</span>
          </button>

          
        </form>
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /* Step 2 — swipe deck                                              */
  /* ---------------------------------------------------------------- */
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col items-center">
      <div className="mb-4 flex w-full items-center justify-between gap-3 text-[11.5px]">
        <button
          type="button"
          onClick={openSetup}
          className="inline-flex items-center gap-1.5 font-semibold text-gray-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.2} />
          <span>Edit budget (€{budget})</span>
        </button>

        <span className="rounded-md border border-[#FE3C72]/30 bg-[#FE3C72]/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-[#FE3C72]">
          {roleLabel}
        </span>
      </div>

      {activeDeal ? (
        <div className="flex w-full flex-col items-center">
          <div
            className={`relative h-[min(58vh,460px)] min-h-[340px] w-full select-none overflow-hidden rounded-xl border border-[#FE3C72]/30 bg-[#0e131b] shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.15),0_8px_32px_0_rgba(0,0,0,0.45),0_0_48px_-16px_rgba(254,60,114,0.55)] transition-all duration-200 ${
              lastAction === "pass" ? "-rotate-3 scale-95 opacity-50" : ""
            } ${lastAction === "like" ? "rotate-3 scale-95 opacity-50" : ""}`}
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url('${activeDeal.image}')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#080b10] via-black/45 to-black/5" />

            <div className="absolute inset-x-4 top-4 flex items-center justify-between gap-3">
              <span className="rounded-md border border-white/10 bg-black/55 px-2.5 py-1.5 font-mono text-[9.5px] font-medium uppercase tracking-[0.06em] text-white/90 backdrop-blur-md">
                {activeDeal.trainType}
              </span>
              <span className="flex items-center gap-1.5 rounded-md bg-white px-2.5 py-1.5 text-[12px] font-extrabold text-[#080b10] tabular-nums">
                €{activeDeal.price.toFixed(2)}
                <span className="text-[9.5px] font-medium text-gray-500 line-through">
                  €{activeDeal.originalPrice.toFixed(2)}
                </span>
              </span>
            </div>

            <div className="absolute inset-x-5 bottom-5 text-left">
              <div className="mb-1.5 text-[9px] font-medium uppercase tracking-[0.14em] text-white/65">
                {from} → {activeDeal.destination}
              </div>

              <h4 className="text-[27px] font-extrabold leading-tight tracking-[-0.045em] text-white">
                {activeDeal.destination}
              </h4>

              <p className="mt-2 text-[11.5px] leading-relaxed text-white/75">
                {activeDeal.highlight}
              </p>

              <div className="mt-3 flex items-center justify-between border-t border-white/15 pt-3 text-[10.5px] font-semibold text-white/80 tabular-nums">
                <span>Departs {activeDeal.departureTime}</span>
                <span>{activeDeal.duration}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-7">
            <button
              onClick={() => handleSwipe("left")}
              aria-label="Pass destination"
              className="flex h-[56px] w-[56px] items-center justify-center rounded-full border border-white/10 bg-white/[0.045] text-white backdrop-blur-xl transition-all duration-150 hover:border-white/20 hover:bg-white/[0.09] active:scale-90"
            >
              <X className="h-6 w-6" strokeWidth={2.5} />
            </button>

            <button
              onClick={() => handleSwipe("right")}
              aria-label="Save and match destination"
              className="flex h-[56px] w-[56px] items-center justify-center rounded-full bg-[#FE3C72] text-white shadow-[0_8px_28px_-8px_rgba(254,60,114,0.8)] transition-all duration-150 hover:bg-[#ff5685] active:scale-90"
            >
              <Heart className="h-6 w-6 fill-current stroke-current" />
            </button>
          </div>

          <div className="mt-5 flex w-full items-center gap-3">
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[#FE3C72] transition-all duration-300"
                style={{
                  width: `${((currentIndex + 1) / filteredDeals.length) * 100}%`,
                }}
              />
            </div>
            <span className="text-[10px] font-medium text-gray-500 tabular-nums">
              {currentIndex + 1}/{filteredDeals.length}
            </span>
          </div>
        </div>
      ) : (
        <div className="w-full rounded-xl border border-[#FE3C72]/25 bg-white/[0.04] p-7 text-center shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.15)] backdrop-blur-xl">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-[#FE3C72]/25 bg-[#FE3C72]/10 text-[#FE3C72]">
            <Flame className="h-6 w-6 fill-current" strokeWidth={0} />
          </div>

          <h3 className="text-[23px] font-extrabold tracking-[-0.045em] text-white">
            Deck complete
          </h3>
          <p className="mt-2 text-[12.5px] leading-relaxed text-gray-400">
            Found{" "}
            <strong className="font-semibold text-[#FE3C72]">
              {savedDeals.length} matches
            </strong>{" "}
            under €{budget} from {from}.
          </p>

          {savedDeals.length > 0 ? (
            <div className="mb-6 mt-5 max-h-56 space-y-2 overflow-y-auto pr-1">
              {savedDeals.map((deal) => (
                <div
                  key={deal.id}
                  className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.035] p-3.5 text-left"
                >
                  <div>
                    <div className="text-[12.5px] font-semibold text-white">
                      {deal.destination}
                    </div>
                    <div className="mt-0.5 text-[10.5px] text-gray-500">
                      {deal.duration} · {deal.trainType}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[13px] font-bold text-[#FE3C72] tabular-nums">
                      €{deal.price.toFixed(2)}
                    </div>
                    <a
                      href="https://www.bahn.de"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-0.5 text-[10.5px] font-semibold text-gray-400 transition-colors hover:text-[#FE3C72]"
                    >
                      Book DB <ArrowRight className="h-2.5 w-2.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mb-6 mt-4 text-[11.5px] text-gray-500">
              No routes saved. Try adjusting your budget.
            </p>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.035] px-4 py-3 text-[11.5px] font-semibold text-white transition-colors duration-150 hover:border-white/15 hover:bg-white/[0.06] active:scale-[0.98]"
            >
              <RotateCcw className="h-3.5 w-3.5" strokeWidth={2} />
              <span>Reshuffle</span>
            </button>
            <button
              type="button"
              onClick={openSetup}
              className="flex-1 rounded-lg border border-white/10 bg-white px-4 py-3 text-[11.5px] font-bold text-[#080b10] transition-colors duration-150 hover:border-[#FE3C72] hover:bg-[#FE3C72] hover:text-white active:scale-[0.98]"
            >
              Change budget
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
