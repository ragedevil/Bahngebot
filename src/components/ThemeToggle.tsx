"use client";

import React, { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";

function subscribeToTheme(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

function getThemeSnapshot(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function getServerThemeSnapshot(): Theme {
  return "dark";
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );

  const applyTheme = (next: Theme) => {
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem("bahngebot-theme", next);
    } catch {
      // Private mode — fall back to the in-memory theme.
    }
  };

  const options: { value: Theme; label: string; icon: typeof Sun }[] = [
    { value: "light", label: "Light mode", icon: Sun },
    { value: "dark", label: "Dark mode", icon: Moon },
  ];

  return (
    <div
      role="group"
      aria-label="Color theme"
      className="flex items-center gap-0.5 rounded-full bg-surface-raised p-1"
    >
      {options.map(({ value, label, icon: Icon }) => {
        const isActive = theme === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => applyTheme(value)}
            aria-label={label}
            aria-pressed={isActive}
            title={label}
            className={`flex h-7 w-7 items-center justify-center rounded-full transition-apple active:scale-95 ${
              isActive
                ? "bg-pill text-ink"
                : "text-muted hover:text-ink"
            }`}
          >
            <Icon className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        );
      })}
    </div>
  );
}
