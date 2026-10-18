"use client";

import React, { useId, useRef, useState } from "react";
import type { StationSuggestion } from "@/types/station";
import { useStationSuggestions } from "@/hooks/useStationSuggestions";

interface StationInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  /** Extra classes for the `<input>` itself (the dock sizes text here). */
  inputClassName?: string;
  /** Extra classes for the popup list. */
  listClassName?: string;
}

/**
 * Station field with live autocomplete.
 *
 * The dropdown only opens while the field is focused and the text differs
 * from the last committed pick, so choosing "Dortmund Hbf" closes it instead
 * of immediately re-querying. Options are exposed as an ARIA combobox.
 */
export function StationInput({
  id,
  value,
  onChange,
  placeholder,
  required,
  inputClassName = "",
  listClassName = "",
}: StationInputProps) {
  const listboxId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const { suggestions, isLoading } = useStationSuggestions(isOpen ? value : null);
  const isExpanded = isOpen && suggestions.length > 0;

  const commit = (station: StationSuggestion) => {
    onChange(station.name);
    setIsOpen(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!isExpanded) {
        setIsOpen(true);
        return;
      }
      setActiveIndex((index) => (index + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!isExpanded) return;
      setActiveIndex(
        (index) => (index - 1 + suggestions.length) % suggestions.length,
      );
    } else if (event.key === "Enter" && isExpanded && activeIndex >= 0) {
      // Steal Enter from the surrounding form: pick, don't submit.
      event.preventDefault();
      commit(suggestions[activeIndex]);
    } else if (event.key === "Escape" && isOpen) {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  return (
    <div className="relative min-w-0">
      <input
        ref={inputRef}
        id={id}
        type="text"
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          setIsOpen(true);
          setActiveIndex(-1);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => {
          setIsOpen(false);
          setActiveIndex(-1);
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        required={required}
        role="combobox"
        aria-expanded={isExpanded}
        aria-controls={isExpanded ? listboxId : undefined}
        aria-autocomplete="list"
        aria-activedescendant={
          isExpanded && activeIndex >= 0
            ? `${listboxId}-option-${activeIndex}`
            : undefined
        }
        className={inputClassName}
      />

      {isOpen && (suggestions.length > 0 || isLoading) && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label="Station suggestions"
          className={`absolute left-0 right-0 top-full z-50 mt-2 max-h-64 overflow-y-auto rounded-xl border border-white/[0.1] bg-[#11161f]/95 p-1 shadow-[0_16px_40px_-16px_rgba(0,0,0,0.9)] backdrop-blur-xl ${listClassName}`}
        >
          {isExpanded ? (
            suggestions.map((station, index) => (
              <li key={station.name} id={`${listboxId}-option-${index}`} role="option" aria-selected={index === activeIndex}>
                {/* onMouseDown, not onClick: fires before the input's blur. */}
                <button
                  type="button"
                  tabIndex={-1}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    commit(station);
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`flex w-full items-baseline justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    index === activeIndex
                      ? "bg-white/[0.08] text-white"
                      : "text-zinc-200 hover:bg-white/[0.06]"
                  }`}
                >
                  <span className="truncate font-medium">{station.name}</span>
                  <span className="shrink-0 text-xs text-zinc-500">
                    {station.city}
                  </span>
                </button>
              </li>
            ))
          ) : (
            <li className="px-3 py-2 text-sm text-zinc-500">Looking up…</li>
          )}
        </ul>
      )}
    </div>
  );
}
