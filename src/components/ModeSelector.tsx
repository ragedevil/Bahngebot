import React from "react";
import { Compass, Navigation } from "lucide-react";
import { ModeCard } from "./ModeCard";

export type TravelMode = "specific" | "tinder";

interface ModeSelectorProps {
  onSelect: (mode: TravelMode) => void;
}

export function ModeSelector({ onSelect }: ModeSelectorProps) {
  return (
    <div className="grid w-full gap-4 sm:grid-cols-2">
      <ModeCard
        title="Specific route"
        description="Plan a precise connection between two stations, with flexible dates and live Sparpreis fares."
        cta="Enter route"
        icon={Navigation}
        onClick={() => onSelect("specific")}
      />
      <ModeCard
        title="Discover fares"
        description="Set a departure city and budget, then swipe through handpicked rail deals you didn't know existed."
        cta="Explore tracks"
        icon={Compass}
        onClick={() => onSelect("tinder")}
      />
    </div>
  );
}
