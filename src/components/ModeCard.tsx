import React from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";

interface ModeCardProps {
  title: string;
  description: string;
  cta: string;
  icon: LucideIcon;
  onClick: () => void;
}

export function ModeCard({
  title,
  description,
  cta,
  icon: Icon,
  onClick,
}: ModeCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="app-card group relative flex w-full flex-col rounded-3xl p-6 text-left transition-colors duration-200 hover:border-ink/10 sm:p-8"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 text-brand">
        <Icon className="h-5 w-5" strokeWidth={2} />
      </span>

      <span className="mt-9 flex flex-1 flex-col">
        <span className="block text-[24px] font-bold leading-tight tracking-[-0.04em] text-ink">
          {title}
        </span>
        <span className="mt-3 block max-w-[34ch] text-[13.5px] leading-relaxed text-muted">
          {description}
        </span>
      </span>

      <span className="mt-8 flex items-center justify-between border-t border-hairline pt-5">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-3.5 py-2 text-[12px] font-semibold text-brand transition-colors duration-200 group-hover:bg-brand group-hover:text-brand-ink">
          {cta}
          <ArrowRight
            className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
            strokeWidth={2.2}
          />
        </span>
      </span>
    </button>
  );
}
