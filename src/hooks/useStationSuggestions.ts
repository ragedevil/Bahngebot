"use client";

import { useEffect, useState } from "react";
import type { StationSuggestion } from "@/types/station";

const DEBOUNCE_MS = 150;
const MIN_QUERY_LENGTH = 2;
const NO_RESULTS: StationSuggestion[] = [];

interface LookupResult {
  query: string;
  stations: StationSuggestion[];
}

/**
 * Debounced station lookup against `/api/stations`.
 *
 * Pass `null` for `query` to keep the dropdown closed without a request.
 * Results are tagged with the query that produced them, so a stale response
 * can never be shown against newer text and no reset-on-change is needed.
 */
export function useStationSuggestions(query: string | null) {
  const trimmed = query?.trim() ?? "";
  const isActive = trimmed.length >= MIN_QUERY_LENGTH;
  const [result, setResult] = useState<LookupResult | null>(null);

  useEffect(() => {
    if (!isActive) return;

    const controller = new AbortController();

    const timeout = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/stations?q=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal },
        );
        if (!response.ok) throw new Error(`Lookup failed: ${response.status}`);
        const data = (await response.json()) as {
          stations?: StationSuggestion[];
        };
        setResult({ query: trimmed, stations: data.stations ?? [] });
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setResult({ query: trimmed, stations: [] });
        }
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [trimmed, isActive]);

  if (!isActive) {
    return { suggestions: NO_RESULTS, isLoading: false };
  }

  const isFresh = result?.query === trimmed;
  return {
    suggestions: isFresh ? result.stations : NO_RESULTS,
    isLoading: !isFresh,
  };
}
