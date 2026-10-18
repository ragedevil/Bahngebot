import React from "react";
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

interface NavbarProps {
  /**
   * Right-hand controls (e.g. a mode toggle). They sit in their own grid
   * column, so they can never shift the brand off the viewport centre.
   */
  actions?: React.ReactNode;
}

/**
 * Global header.
 *
 * Layout is a three-column grid across the *full* viewport width — not a
 * centred max-width column — so `bahngebot` lands on the viewport's exact
 * horizontal centre on every screen size. Columns are equal (`1fr auto 1fr`),
 * which keeps the brand centred even when left/right controls differ in width.
 *
 * The header is transparent and floats over the page scrim; the brand is set
 * in the app's global sans (Jakarta, via `font-sans`) with crisp rendering —
 * no text shadows, no glows. This wordmark is the typographic reference for
 * the rest of the UI: every unresolved family inherits from it.
 */
export function Navbar({ actions }: NavbarProps) {
  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-30 w-full bg-transparent pt-[env(safe-area-inset-top)] backdrop-blur-md">
      <nav
        aria-label="Primary"
        className="grid h-14 w-full grid-cols-[1fr_auto_1fr] items-center px-5 sm:h-16 sm:px-8"
      >
        {/* Left rail: intentionally empty. */}
        <div aria-hidden="true" />

        <Link
          href="/"
          className="pointer-events-auto justify-self-center rounded-lg px-1 font-sans text-xl font-bold tracking-tight text-white"
          aria-label="bahngebot — home"
        >
          bahngebot
        </Link>

        <div className="pointer-events-auto flex items-center justify-end gap-1">
          {actions}
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
