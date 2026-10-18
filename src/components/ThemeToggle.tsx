"use client";

import React, { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

const STORAGE_KEY = "bahngebot:theme";

type Theme = "dark" | "light";

/** Read the theme the pre-paint script already committed to `<html>`. */
function readTheme(): Theme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

/** The script in `layout.tsx` owns the DOM; this notifies the toggle. */
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function applyTheme(next: Theme) {
  document.documentElement.dataset.theme = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Private mode: the session keeps the choice, storage just won't.
  }
  listeners.forEach((listener) => listener());
}

/**
 * Compact sun/moon switch for the header.
 *
 * Renders the moon glyph on the server and swaps to the real icon after
 * hydration, so the prerendered markup stays static and never mismatches.
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const theme = useSyncExternalStore(
    subscribe,
    readTheme,
    () => "dark" as Theme,
  );

  const isLight = theme === "light";
  const next: Theme = isLight ? "dark" : "light";

  return (
    <button
      type="button"
      onClick={() => applyTheme(next)}
      aria-label={`Switch to ${next} theme`}
      aria-pressed={isLight}
      title={`Switch to ${next} theme`}
      className={`flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-zinc-400 transition-colors hover:bg-white/[0.12] hover:text-white ${className}`}
    >
      {isLight ? (
        <Sun className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
      ) : (
        <Moon className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
      )}
    </button>
  );
}
