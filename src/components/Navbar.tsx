import React from "react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-2xl bg-black/60 border-b border-white/[0.08] transition-colors">
      <div className="max-w-5xl mx-auto px-6 h-12 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <span className="font-semibold text-sm tracking-tight text-white">
            bahngebot
          </span>
          <span className="text-[11px] text-zinc-500 font-normal">
            Deutsche Bahn Index
          </span>
        </div>

        {/* Center navigation */}
        <nav className="hidden md:flex items-center gap-7 text-[12px] text-zinc-400 font-normal">
          <a href="#search" className="hover:text-white transition-colors duration-150">
            Overview
          </a>
          <a href="#results" className="hover:text-white transition-colors duration-150">
            Fares
          </a>
          <a href="#routes" className="hover:text-white transition-colors duration-150">
            Routes
          </a>
        </nav>

        {/* Right CTA */}
        <div className="flex items-center gap-3">
          <a
            href="#search"
            className="text-[12px] font-medium px-3 py-1 rounded-full bg-white text-black hover:bg-zinc-200 transition-colors duration-150"
          >
            Search
          </a>
        </div>

      </div>
    </header>
  );
}
