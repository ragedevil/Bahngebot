"use client";

import React from "react";
import type { TravelMode } from "@/types/travel";
import { Navbar } from "./Navbar";
import { RailMapBackdrop } from "./RailMapBackdrop";

interface AppShellProps {
  /** Drives the map tint, exposed as `data-mode` for descendant styling. */
  mode: TravelMode;
  /** Optional right-hand header controls (e.g. a mode toggle). */
  headerActions?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Shared shell for every non-landing route: the global header floating over
 * the persistent rail map, tinted by mode. The header is a transparent overlay,
 * so it never displaces the map or the view's own spacing.
 */
export function AppShell({ mode, headerActions, children }: AppShellProps) {
  return (
    <div
      data-mode={mode}
      className="relative z-10 flex min-h-dvh flex-col bg-canvas"
    >
      <RailMapBackdrop mode={mode} />
      <Navbar actions={headerActions} />
      {children}
    </div>
  );
}
