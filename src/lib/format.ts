import type { FareCategory } from "@/types/rail";

const clockFormatter = new Intl.DateTimeFormat("de-DE", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const dayFormatter = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
});

/** Format an ISO timestamp as a local wall-clock time, e.g. `07:28`. */
export function formatClock(isoDateTime: string): string {
  return clockFormatter.format(new Date(isoDateTime));
}

/** Format a duration in minutes, e.g. `3h 54m`. */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) return `${remainingMinutes}m`;
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${remainingMinutes.toString().padStart(2, "0")}m`;
}

/** Format a price stored in cents as a euro amount, e.g. `€17.50`. */
export function formatPrice(priceInCents: number): string {
  return `€${(priceInCents / 100).toFixed(2)}`;
}

/** Short label for a departure date, e.g. `Sat 24`. */
export function formatDay(isoDate: string): string {
  return dayFormatter.format(new Date(`${isoDate}T12:00:00`));
}

/** Calendar key (YYYY-MM-DD) for an ISO timestamp. */
export function toDateKey(isoDateTime: string): string {
  return isoDateTime.slice(0, 10);
}

/** Shift an ISO date (YYYY-MM-DD) by a number of calendar days. */
export function shiftIsoDate(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** Inclusive list of ISO dates around a centre date, e.g. `-3` to `+3`. */
export function isoDateRange(
  centreDate: string,
  daysBefore: number,
  daysAfter: number,
): string[] {
  return Array.from(
    { length: daysBefore + daysAfter + 1 },
    (_, index) => shiftIsoDate(centreDate, index - daysBefore),
  );
}

const CATEGORY_LABELS: Readonly<Record<FareCategory, string>> = {
  SUPER_SPARPREIS: "Super Sparpreis",
  SPARPREIS: "Sparpreis",
  FLEXPREIS: "Flexpreis",
};

export function formatFareCategory(category: FareCategory): string {
  return CATEGORY_LABELS[category];
}
