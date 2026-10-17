"use client";

import React, { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";

import { searchStations } from "@/lib/api-client";
import type { StationSelection } from "@/lib/stations";
import type { Station } from "@/types/rail";

interface StationAutocompleteProps {
  value: StationSelection | null;
  onChange: (station: StationSelection | null) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

function isAbortError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    (error as { name?: string }).name === "AbortError"
  );
}

/**
 * Debounced station lookup backed by `GET /api/stations/search`.
 * Selecting a suggestion stores the EVA id and the readable station name.
 */
export function StationAutocomplete({
  value,
  onChange,
  placeholder = "e.g. Berlin Hbf, München Hbf...",
  className = "",
  required = false,
}: StationAutocompleteProps) {
  const [query, setQuery] = useState(value?.name ?? "");
  const [results, setResults] = useState<Station[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedId = value?.id;
  const selectedName = value?.name;

  // Keep the visible text in sync when the parent changes the station, e.g. swap.
  useEffect(() => {
    if (selectedName) setQuery(selectedName);
  }, [selectedId, selectedName]);

  useEffect(() => {
    const trimmed = query.trim();

    if (!isOpen || trimmed.length < 2 || trimmed === selectedName) {
      setResults([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await searchStations(trimmed, {
          signal: controller.signal,
        });
        if (!controller.signal.aborted) setResults(response.data);
      } catch (requestError) {
        if (!controller.signal.aborted && !isAbortError(requestError)) {
          setResults([]);
          setError("Could not load stations.");
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, isOpen, selectedName]);

  const handleQueryChange = (nextQuery: string) => {
    setQuery(nextQuery);
    setIsOpen(true);
    if (value) onChange(null);
  };

  const handleSelect = (station: Station) => {
    onChange({ id: station.id, name: station.name });
    setQuery(station.name);
    setResults([]);
    setIsOpen(false);
    setError(null);
  };

  const showDropdown =
    isOpen && query.trim().length >= 2 && query.trim() !== selectedName;

  return (
    <div className="relative w-full">
      <input
        type="text"
        autoComplete="off"
        required={required}
        value={query}
        onChange={(event) => handleQueryChange(event.target.value)}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 120)}
        placeholder={placeholder}
        aria-autocomplete="list"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={showDropdown}
        className={className}
      />

      {showDropdown && (
        <ul
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-2 max-h-64 overflow-y-auto rounded-2xl bg-[#18181B]/95 backdrop-blur-2xl shadow-2xl shadow-black/50 py-1"
        >
          {isLoading && (
            <li className="flex items-center gap-2 px-4 py-3 text-xs text-zinc-400">
              <LoaderCircle className="w-3.5 h-3.5 animate-spin" />
              <span>Searching stations...</span>
            </li>
          )}

          {!isLoading && error && (
            <li className="px-4 py-3 text-xs text-[#FF4458]">{error}</li>
          )}

          {!isLoading && !error && results.length === 0 && (
            <li className="px-4 py-3 text-xs text-zinc-400">
              No stations found.
            </li>
          )}

          {!isLoading &&
            !error &&
            results.map((station) => (
              <li key={station.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={station.id === selectedId}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    handleSelect(station);
                  }}
                  className={`w-full px-4 py-2.5 text-left transition-colors cursor-pointer ${
                    station.id === selectedId
                      ? "bg-white/10"
                      : "hover:bg-white/[0.08]"
                  }`}
                >
                  <span className="block text-sm font-medium text-[#FAFAFA]">
                    {station.name}
                  </span>
                  <span className="block text-[11px] text-zinc-400">
                    {station.city} · {station.country}
                  </span>
                </button>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
