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

const BUDGET_MIN = 15;
const BUDGET_MAX = 60;

export function TinderMode() {
  const [from, setFrom] = useState("Berlin Hbf");
  const [budget, setBudget] = useState<number>(30);
  const [date, setDate] = useState("2026-10-24");
  const [perspective, setPerspective] = useState<Perspective>("curated");
  const [hasStartedSwiping, setHasStartedSwiping] = useState(false);
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

  /* ---------------------------------------------------------------- */
  /* Step 1 — filter setup                                            */
  /* ---------------------------------------------------------------- */
  if (!hasStartedSwiping) {
    return (
      <div className="mx-auto w-full max-w-lg">
        <form
          onSubmit={handleStart}
          className="app-card rounded-[28px] p-6 sm:p-8"
        >
          <div className="flex items-center justify-between gap-4">
            <span className="text-[10px] font-semibold tracking-[0.14em] text-muted uppercase">
              Swipe setup
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-coral/10 px-3 py-1.5 text-[10px] font-semibold tracking-[0.08em] text-coral uppercase">
              <Flame className="h-3 w-3 fill-current" strokeWidth={0} />
              Tinder explore
            </span>
          </div>

          <div className="mt-7">
            <h2 className="text-[26px] font-bold leading-tight tracking-[-0.04em] text-ink sm:text-[30px]">
              Let the route find you.
            </h2>
            <p className="mt-2 max-w-[38ch] text-[14px] leading-relaxed text-muted">
              Set your departure city and budget. We&apos;ll deal the hidden
              Sparpreis fares.
            </p>
          </div>

          <div className="mt-7 space-y-5">
            {/* Departure station */}
            <div className="space-y-2">
              <label htmlFor="departure-station" className="field-label">
                Departure station
              </label>
              <div className="flex items-center gap-3 rounded-2xl bg-surface-raised px-4 py-3.5">
                <MapPin className="h-4 w-4 shrink-0 text-coral" strokeWidth={2} />
                <input
                  id="departure-station"
                  type="text"
                  required
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  placeholder="e.g. Berlin Hbf"
                  autoComplete="off"
                  className="w-full bg-transparent text-[14px] font-medium text-ink placeholder:text-muted/70 focus:outline-none"
                />
              </div>
            </div>

            {/* Budget slider */}
            <div>
              <div className="flex items-center justify-between gap-3">
                <label htmlFor="budget-range" className="field-label">
                  Maximum budget
                </label>
                <span className="flex items-baseline gap-1">
                  <span className="text-[22px] font-bold leading-none tracking-[-0.04em] text-coral">
                    €{budget}
                  </span>
                  <span className="text-[11px] font-medium text-muted">
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

                <div className="relative mt-1 h-4 text-[11px] font-medium">
                  <span className="absolute left-0 top-0 text-muted">€15</span>
                  <span className="absolute left-1/3 top-0 -translate-x-1/2 whitespace-nowrap text-coral">
                    €30 <span className="font-normal text-muted">Sparpreis</span>
                  </span>
                  <span className="absolute right-0 top-0 text-muted">€60+</span>
                </div>
              </div>
            </div>

            {/* Date & role */}
            <div className="grid gap-4 sm:grid-cols-2 sm:gap-3">
              <div className="space-y-2">
                <label htmlFor="departure-date" className="field-label">
                  Departure date
                </label>
                <div className="flex items-center gap-2.5 rounded-2xl bg-surface-raised px-3.5 py-3.5">
                  <Calendar
                    className="h-4 w-4 shrink-0 text-muted"
                    strokeWidth={2}
                  />
                  <input
                    id="departure-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full cursor-pointer bg-transparent text-[13px] font-medium text-ink focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <span className="field-label">Swipe style</span>
                <div
                  role="group"
                  aria-label="Swipe style"
                  className="flex rounded-full bg-surface-raised p-1"
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
                        className={`flex-1 rounded-full px-2 py-2 text-[12px] font-semibold transition-apple active:scale-[0.98] ${
                          isActive
                            ? "bg-pill text-ink shadow-[0_1px_2px_rgba(0,0,0,0.14)]"
                            : "text-muted hover:text-ink"
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
            className="mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-coral py-4 text-[15px] font-semibold text-brand-ink transition-transform duration-150 hover:bg-coral/90 active:scale-[0.98]"
          >
            <Flame className="h-4 w-4 fill-current" strokeWidth={0} />
            <span>Start swiping tracks</span>
          </button>

          <p className="mt-3.5 text-center text-[11px] font-medium text-muted">
            No booking fees · Live Deutsche Bahn inventory
          </p>
        </form>
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /* Step 2 — swipe deck                                              */
  /* ---------------------------------------------------------------- */
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col items-center">
      <div className="mb-4 flex w-full items-center justify-between gap-3 text-[12px]">
        <button
          onClick={() => setHasStartedSwiping(false)}
          className="inline-flex items-center gap-1.5 font-medium text-muted transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.2} />
          <span>Edit budget (€{budget})</span>
        </button>

        <span className="rounded-full bg-coral/10 px-3 py-1.5 text-[10px] font-semibold tracking-[0.06em] text-coral uppercase">
          {roleLabel}
        </span>
      </div>

      {activeDeal ? (
        <div className="flex w-full flex-col items-center">
          <div
            className={`relative h-[min(58vh,460px)] min-h-[340px] w-full select-none overflow-hidden rounded-[28px] bg-surface-raised transition-all duration-200 ${
              lastAction === "pass" ? "-rotate-3 scale-95 opacity-50" : ""
            } ${lastAction === "like" ? "rotate-3 scale-95 opacity-50" : ""}`}
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url('${activeDeal.image}')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />

            <div className="absolute inset-x-4 top-4 flex items-center justify-between gap-3">
              <span className="rounded-full bg-black/60 px-3 py-1.5 text-[10px] font-semibold tracking-[0.04em] text-white">
                {activeDeal.trainType}
              </span>
              <span className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[12px] font-bold text-[#11141A]">
                €{activeDeal.price.toFixed(2)}
                <span className="text-[10px] font-normal text-[#687182] line-through">
                  €{activeDeal.originalPrice.toFixed(2)}
                </span>
              </span>
            </div>

            <div className="absolute inset-x-5 bottom-5 text-left">
              <div className="mb-1.5 text-[10px] font-semibold tracking-[0.1em] text-white/75 uppercase">
                {from} → {activeDeal.destination}
              </div>

              <h4 className="text-[28px] font-bold leading-tight tracking-[-0.04em] text-white">
                {activeDeal.destination}
              </h4>

              <p className="mt-2 text-[12px] leading-relaxed text-white/85">
                {activeDeal.highlight}
              </p>

              <div className="mt-3 flex items-center justify-between border-t border-white/20 pt-3 text-[10.5px] font-medium text-white/80">
                <span>Departs {activeDeal.departureTime}</span>
                <span>{activeDeal.duration}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-7">
            <button
              onClick={() => handleSwipe("left")}
              aria-label="Pass destination"
              className="flex h-[58px] w-[58px] items-center justify-center rounded-full bg-surface text-ink transition-transform duration-150 hover:bg-surface-raised active:scale-90"
            >
              <X className="h-6 w-6" strokeWidth={2.5} />
            </button>

            <button
              onClick={() => handleSwipe("right")}
              aria-label="Save and match destination"
              className="flex h-[58px] w-[58px] items-center justify-center rounded-full bg-coral text-brand-ink transition-transform duration-150 hover:bg-coral/90 active:scale-90"
            >
              <Heart className="h-6 w-6 fill-brand-ink stroke-brand-ink" />
            </button>
          </div>

          <div className="mt-5 flex w-full items-center gap-3">
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-surface-raised">
              <div
                className="h-full rounded-full bg-coral transition-all duration-300"
                style={{
                  width: `${((currentIndex + 1) / filteredDeals.length) * 100}%`,
                }}
              />
            </div>
            <span className="text-[10px] font-medium tabular-nums text-muted">
              {currentIndex + 1}/{filteredDeals.length}
            </span>
          </div>
        </div>
      ) : (
        <div className="app-card w-full rounded-[28px] p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-coral/10 text-coral">
            <Flame className="h-6 w-6 fill-current" strokeWidth={0} />
          </div>

          <h3 className="text-[24px] font-bold tracking-[-0.04em] text-ink">
            Deck complete
          </h3>
          <p className="mt-2 text-[13px] leading-relaxed text-muted">
            Found{" "}
            <strong className="font-semibold text-coral">
              {savedDeals.length} matches
            </strong>{" "}
            under €{budget} from {from}.
          </p>

          {savedDeals.length > 0 ? (
            <div className="mb-6 mt-5 max-h-56 space-y-2 overflow-y-auto pr-1">
              {savedDeals.map((deal) => (
                <div
                  key={deal.id}
                  className="flex items-center justify-between rounded-2xl bg-surface-raised p-3.5 text-left"
                >
                  <div>
                    <div className="text-[13px] font-semibold text-ink">
                      {deal.destination}
                    </div>
                    <div className="mt-0.5 text-[11px] text-muted">
                      {deal.duration} · {deal.trainType}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[13px] font-bold text-savings">
                      €{deal.price.toFixed(2)}
                    </div>
                    <a
                      href="https://www.bahn.de"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-coral hover:underline"
                    >
                      Book DB <ArrowRight className="h-2.5 w-2.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mb-6 mt-4 text-[12px] text-muted">
              No routes saved. Try adjusting your budget.
            </p>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-surface-raised py-3 px-4 text-[12px] font-semibold text-ink transition-transform duration-150 active:scale-[0.98]"
            >
              <RotateCcw className="h-3.5 w-3.5" strokeWidth={2} />
              <span>Reshuffle</span>
            </button>
            <button
              onClick={() => setHasStartedSwiping(false)}
              className="flex-1 rounded-full bg-coral py-3 px-4 text-[12px] font-semibold text-brand-ink transition-transform duration-150 hover:bg-coral/90 active:scale-[0.98]"
            >
              Change budget
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
