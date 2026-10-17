import React from "react";
import { TrainFront } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export function Navbar() {
  return (
    <header className="relative z-30 w-full border-b border-hairline bg-canvas">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-5 sm:h-[72px] sm:px-8">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-brand-ink">
            <TrainFront className="h-4 w-4" strokeWidth={2.2} />
          </span>
          <span className="text-[15px] font-semibold tracking-[-0.025em] text-ink">
            bahngebot
          </span>
        </div>

        <ThemeToggle />
      </div>
    </header>
  );
}
