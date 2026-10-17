"use client";

import React, { useState } from "react";
import { X, Heart, RotateCcw, ArrowRight, Calendar, MapPin, Sparkles, ArrowLeft, Flame } from "lucide-react";

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
      price: 17.50,
      originalPrice: 79.90,
      duration: "3h 54m",
      trainType: "ICE Sprinter",
      departureTime: "07:28",
      highlight: "Direct high-speed corridor straight into Bavaria.",
      image: "https://images.unsplash.com/photo-1595867818082-083862f3d630?q=80&w=1200&auto=format&fit=crop",
    },
    {
      id: "deal-2",
      from: "Berlin Hbf",
      destination: "Wien Hbf",
      price: 24.90,
      originalPrice: 89.00,
      duration: "7h 10m",
      trainType: "ICE / Railjet",
      departureTime: "08:15",
      highlight: "Scenic cross-border route to Austrian coffee houses.",
      image: "https://images.unsplash.com/photo-1516550893923-42d28e5677af?q=80&w=1200&auto=format&fit=crop",
    },
    {
      id: "deal-3",
      from: "Berlin Hbf",
      destination: "Amsterdam Centraal",
      price: 27.90,
      originalPrice: 95.00,
      duration: "5h 48m",
      trainType: "IC International",
      departureTime: "09:34",
      highlight: "Direct train across Dutch countryside to the canals.",
      image: "https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?q=80&w=1200&auto=format&fit=crop",
    },
    {
      id: "deal-4",
      from: "Berlin Hbf",
      destination: "Hamburg Hbf",
      price: 14.90,
      originalPrice: 49.00,
      duration: "1h 45m",
      trainType: "ICE",
      departureTime: "10:04",
      highlight: "Sub-2-hour blast to the Elbphilharmonie and harbor.",
      image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?q=80&w=1200&auto=format&fit=crop",
    },
    {
      id: "deal-5",
      from: "Berlin Hbf",
      destination: "Köln Hbf",
      price: 19.90,
      originalPrice: 74.00,
      duration: "4h 12m",
      trainType: "ICE",
      departureTime: "11:28",
      highlight: "World-famous Cathedral right outside the platform gate.",
      image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=1200&auto=format&fit=crop",
    },
    {
      id: "deal-6",
      from: "Berlin Hbf",
      destination: "Zürich HB",
      price: 34.90,
      originalPrice: 119.00,
      duration: "8h 20m",
      trainType: "ICE Nightjet",
      departureTime: "20:45",
      highlight: "Alpine getaway with scenic lake and mountain views.",
      image: "https://images.unsplash.com/photo-1515488764276-beab7607c1e6?q=80&w=1200&auto=format&fit=crop",
    },
  ],
};

interface TinderModeProps {
  onBack: () => void;
}

export function TinderMode({ onBack }: TinderModeProps) {
  const [from, setFrom] = useState("Berlin Hbf");
  const [budget, setBudget] = useState<number>(30);
  const [date, setDate] = useState("2026-10-24");
  const [gender, setGender] = useState<"boy" | "girl">("boy");
  const [hasStartedSwiping, setHasStartedSwiping] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [savedDeals, setSavedDeals] = useState<TrainDeal[]>([]);
  const [lastAction, setLastAction] = useState<"pass" | "like" | null>(null);

  const filteredDeals = DEALS_DATABASE.default.filter((d) => d.price <= budget);
  const activeDeal = filteredDeals[currentIndex];
  const roleLabel = gender === "boy" ? "I will rail" : "I'll be railed";

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

  // STEP 1: Starting Destination & Budget Form (Lighter surface, no harsh borders, Tinder Pink highlights)
  if (!hasStartedSwiping) {
    return (
      <div className="w-full max-w-lg mx-auto">
        <form
          onSubmit={handleStart}
          className="bg-white/[0.08] rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl space-y-6 text-left"
        >
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onBack}
              className="text-xs text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Modes</span>
            </button>

            <span className="text-[11px] font-medium px-3 py-1 rounded-full bg-[#FF4458]/20 text-[#FF4458] flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 fill-current" />
              Tinder Explore
            </span>
          </div>

          <div>
            <h3 className="text-2xl font-semibold tracking-tight text-[#FAFAFA]">
              Where are you starting?
            </h3>
            <p className="text-xs sm:text-sm text-zinc-300 mt-1">
              Set your departure station and maximum budget per connection.
            </p>
          </div>

          {/* Starting Station */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium uppercase tracking-wider text-zinc-300">
              Starting Station
            </label>
            <div className="px-4 py-3.5 bg-white/[0.06] rounded-2xl flex items-center gap-3">
              <MapPin className="w-4 h-4 text-[#FF4458] shrink-0" />
              <input
                type="text"
                required
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                placeholder="e.g. Berlin Hbf, München Hbf..."
                className="w-full bg-transparent text-[#FAFAFA] placeholder-zinc-400 focus:outline-none text-sm font-medium"
              />
            </div>
          </div>

          {/* Budget Range Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="font-medium uppercase tracking-wider text-zinc-300 text-[11px]">
                Maximum Budget
              </span>
              <span className="text-[#FF4458] font-bold font-mono text-base">
                Up to €{budget}
              </span>
            </div>

            <input
              type="range"
              min={15}
              max={60}
              step={5}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full accent-[#FF4458] bg-white/10 rounded-lg h-2 cursor-pointer"
            />

            <div className="flex justify-between text-[11px] text-zinc-400 font-mono">
              <span>€15 (Regional)</span>
              <span className="text-[#FF4458] font-semibold">€30 (Sparpreis)</span>
              <span>€60 (ICE)</span>
            </div>
          </div>

          {/* Departure Date & Gender */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-300 mb-1.5">
                Departure Date
              </label>
              <div className="px-3.5 py-3 bg-white/[0.06] rounded-2xl flex items-center gap-2">
                <Calendar className="w-4 h-4 text-zinc-400 shrink-0" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-transparent text-xs text-[#FAFAFA] focus:outline-none cursor-pointer [color-scheme:dark]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-300 mb-1.5">
                Role / Perspective
              </label>
              <div className="flex p-1 rounded-2xl bg-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setGender("boy")}
                  className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    gender === "boy"
                      ? "bg-[#FF4458] text-white font-semibold shadow-md"
                      : "text-zinc-300 hover:text-white"
                  }`}
                >
                  Boy (I will rail)
                </button>
                <button
                  type="button"
                  onClick={() => setGender("girl")}
                  className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    gender === "girl"
                      ? "bg-[#FF4458] text-white font-semibold shadow-md"
                      : "text-zinc-300 hover:text-white"
                  }`}
                >
                  Girl (I'll be railed)
                </button>
              </div>
            </div>
          </div>

          {/* Action: Tinder Pink (#FF4458) CTA Button */}
          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#FF4458] to-[#FF6036] hover:opacity-95 text-white font-semibold text-sm transition-all shadow-xl shadow-[#FF4458]/30 active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
          >
            <Flame className="w-4 h-4 fill-current" />
            <span>Start Swiping Tracks</span>
          </button>
        </form>
      </div>
    );
  }

  // STEP 2: The Swipe Deck (Lighter, no borders, clean glass cards)
  return (
    <div className="w-full max-w-sm mx-auto flex flex-col items-center">
      {/* Top Header */}
      <div className="w-full flex items-center justify-between mb-4 text-xs">
        <button
          onClick={() => setHasStartedSwiping(false)}
          className="text-zinc-300 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Edit origin & budget (€{budget})</span>
        </button>

        <span className="px-3 py-1 rounded-full bg-[#FF4458]/20 text-[11px] font-medium text-[#FF4458]">
          {roleLabel}
        </span>
      </div>

      {currentIndex < filteredDeals.length ? (
        <div className="w-full flex flex-col items-center">
          <div
            className={`relative w-full h-[460px] rounded-3xl overflow-hidden shadow-2xl transition-all duration-200 bg-zinc-900/90 select-none ${
              lastAction === "pass" ? "scale-95 -rotate-3 opacity-50" : ""
            } ${lastAction === "like" ? "scale-95 rotate-3 opacity-50" : ""}`}
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url('${activeDeal.image}')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

            {/* Top Bar Badges with Signal Green (#10B981) */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
              <span className="text-[11px] font-mono font-medium px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-[#FAFAFA]">
                {activeDeal.trainType}
              </span>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-[#10B981] font-bold text-xs shadow-md">
                <span>€{activeDeal.price.toFixed(2)}</span>
                <span className="text-[10px] text-zinc-400 line-through font-normal">
                  €{activeDeal.originalPrice.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Bottom Card Content */}
            <div className="absolute bottom-6 left-6 right-6 text-left">
              <div className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                {from} → {activeDeal.destination}
              </div>

              <h4 className="text-3xl font-semibold tracking-tight text-[#FAFAFA] leading-tight">
                {activeDeal.destination}
              </h4>

              <p className="text-xs text-zinc-200 mt-2 leading-relaxed">
                {activeDeal.highlight}
              </p>

              <div className="flex items-center justify-between text-[11px] text-zinc-300 font-mono mt-3 pt-3 border-t border-white/10">
                <span>Departs {activeDeal.departureTime}</span>
                <span>Duration {activeDeal.duration}</span>
              </div>
            </div>
          </div>

          {/* Swipe Buttons */}
          <div className="flex items-center gap-8 mt-6">
            <button
              onClick={() => handleSwipe("left")}
              aria-label="Pass destination"
              className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-zinc-300 hover:text-white transition-all active:scale-90 cursor-pointer shadow-lg backdrop-blur-md"
            >
              <X className="w-6 h-6 stroke-[2.5]" />
            </button>

            <button
              onClick={() => handleSwipe("right")}
              aria-label="Save and match destination"
              className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#FF4458] to-[#FF6036] text-white hover:opacity-90 flex items-center justify-center transition-all active:scale-90 shadow-xl shadow-[#FF4458]/35 cursor-pointer"
            >
              <Heart className="w-6 h-6 fill-white stroke-white" />
            </button>
          </div>
        </div>
      ) : (
        /* Finished State */
        <div className="w-full p-8 rounded-3xl bg-white/[0.08] backdrop-blur-2xl text-center shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-[#FF4458]/20 flex items-center justify-center mx-auto mb-4 text-[#FF4458]">
            <Flame className="w-6 h-6 fill-current" />
          </div>

          <h3 className="text-2xl font-semibold tracking-tight text-[#FAFAFA]">
            Deck Complete
          </h3>
          <p className="text-xs sm:text-sm text-zinc-300 mt-2 mb-6">
            Found <strong className="text-[#FF4458]">{savedDeals.length} matches</strong> under €{budget} from {from}.
          </p>

          {savedDeals.length > 0 ? (
            <div className="space-y-2 mb-6 max-h-56 overflow-y-auto pr-1">
              {savedDeals.map((deal) => (
                <div
                  key={deal.id}
                  className="p-3.5 rounded-2xl bg-white/[0.06] flex items-center justify-between text-left"
                >
                  <div>
                    <div className="text-sm font-semibold text-[#FAFAFA]">{deal.destination}</div>
                    <div className="text-[11px] text-zinc-300">{deal.duration} · {deal.trainType}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-[#10B981]">€{deal.price.toFixed(2)}</div>
                    <a
                      href="https://www.bahn.de"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-[#FF4458] hover:underline inline-flex items-center gap-0.5 font-medium"
                    >
                      Book DB <ArrowRight className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-zinc-400 mb-6">No routes saved. Try adjusting your budget.</p>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="flex-1 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-[#FAFAFA] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reshuffle</span>
            </button>
            <button
              onClick={() => setHasStartedSwiping(false)}
              className="flex-1 py-3 px-4 rounded-xl bg-[#FF4458] text-white hover:bg-[#FF6036] text-xs font-semibold transition-all cursor-pointer"
            >
              Change Budget
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
