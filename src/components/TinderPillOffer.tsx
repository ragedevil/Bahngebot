"use client";

import React from "react";
import type { JourneyCriteria } from "@/lib/criteria";
import { TinderLaunch } from "./TinderLaunch";

interface TinderPillOfferProps {
  criteria: JourneyCriteria;
  className?: string;
}

/**
 * Secondary entry point to Tinder Mode, reduced to a single-line chip beneath
 * the route dock. Specific Route owns the hierarchy; this only hints that a
 * second, looser way in exists.
 *
 * Clicking opens the budget & departure dialog immediately (in-page, no
 * interstitial) and the submit CTA lands straight in the swipe deck.
 */
export function TinderPillOffer({ criteria, className = "" }: TinderPillOfferProps) {
  return (
    <TinderLaunch
      criteria={criteria}
      triggerLabel="Flexible? Try Tinder Mode"
      className={className}
    />
  );
}
