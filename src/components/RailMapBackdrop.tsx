import React from "react";
import Image from "next/image";
import type { TravelMode } from "@/types/travel";

interface RailMapBackdropProps {
  /** Only "tinder" recolours the map; route/searching stays neutral. */
  mode?: TravelMode;
  /**
   * Route Mode adds the soft emerald dock glow. Results docks carry their own
   * glass frame, so they opt out to keep the page quiet.
   */
  glow?: boolean;
  className?: string;
}

/**
 * The one rail map behind every viewport.
 *
 * A single static image — generated once from `@/lib/railMap` via
 * `npm run rail-map` — never canvas, SVG geometry or a per-frame repaint.
 * Mode changes are pure CSS: a fixed pink plane cross-fades over a
 * desaturated copy of the same bitmap under `mix-blend-mode: color`, so the
 * browser only composites existing layers. One decoded image, shared.
 */
export function RailMapBackdrop({
  mode = "specific",
  glow = false,
  className = "",
}: RailMapBackdropProps) {
  const tinder = mode === "tinder";
  const glowVisible = tinder || glow;
  const glowClass = tinder
    ? "bg-[radial-gradient(circle_at_50%_30%,rgba(254,60,114,0.22)_0%,transparent_65%)]"
    : "bg-[radial-gradient(circle_at_50%_30%,rgba(29,185,84,0.16)_0%,transparent_65%)]";

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-0 select-none overflow-hidden bg-canvas ${className}`}
    >
      {/* The network: flat and dim at all times. Every mode is a tint above
          it, so the base layer is never re-filtered — only composited. */}
      <Image
        src="/rail-map.jpg"
        alt=""
        fill
        priority
        // The map is a fixed texture, not content: let good enough be enough.
        quality={70}
        sizes="100vw"
        // Already generated at the display ceiling — never re-encode it wider.
        unoptimized
        className="rail-map-texture object-cover opacity-40 brightness-50 contrast-125"
      />

      {/* Tinder tint: colour, not paint, over the green lines.
          `translate-z-0` forces its own compositing layer, which also keeps it
          blending only with the map — never with the page behind this stack
          (the document background is opaque, so that would turn to black). */}
      <div
        className={`absolute inset-0 translate-z-0 bg-[#FE3C72] mix-blend-color transition-opacity duration-300 ease-out motion-reduce:transition-none ${
          tinder ? "opacity-85" : "opacity-0"
        }`}
      />

      {/* Atmosphere glow, anchored to the dock. Same layer rule as the tint.
          The mask fades it vertically too, so it reads as a pool of light
          under the dock rather than a top-aligned slab. */}
      <div
        className={`absolute inset-0 translate-z-0 ${glowClass} [mask-image:radial-gradient(ellipse_70%_60%_at_50%_45%,black_0%,transparent_100%)] transition-opacity duration-300 ease-out motion-reduce:transition-none ${
          glowVisible ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Neutral canvas wash — the constant that keeps text legible. */}
      <div className="absolute inset-0 bg-canvas/80" />

      {/* Vignette: the network falls away at the edges instead of stopping. */}
      <div className="rail-map-vignette absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(9,12,16,0.85)_100%)]" />
    </div>
  );
}
