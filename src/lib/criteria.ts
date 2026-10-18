/** Everything the results view needs to describe a journey search. */
export interface JourneyCriteria {
  from: string;
  to: string;
  date: string;
  passengers: number;
}

/** The two entry states of `/results`, encoded once as query keys. */
export interface ResultSearchParams extends JourneyCriteria {
  mode: "specific" | "tinder";
}

export function parseCriteria(
  searchParams: Record<string, string | string[] | undefined>,
): JourneyCriteria {
  const first = (key: string) => {
    const value = searchParams[key];
    return Array.isArray(value) ? value[0] : value;
  };

  return {
    from: first("from") || "Berlin Hbf",
    to: first("to") || "München Hbf",
    date: first("date") || "2026-10-24",
    passengers: 1,
  };
}

/** Budget ceiling the Tinder dialog writes to the URL (`?budget=`). */
export function parseBudget(
  searchParams: Record<string, string | string[] | undefined>,
  fallback = 30,
): number {
  const raw = searchParams.budget;
  const value = Array.isArray(raw) ? raw[0] : raw;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

const WORKSPACE_KEY = "bahngebot:search";

/** Fired on `window` when this tab rewrites its search, so views can refetch. */
export const CRITERIA_EVENT = "bahngebot:criteria";

/**
 * Remember the last search in this tab so returning to the landing page keeps
 * the inputs intact. Session-scoped, cookie-free — usable in a cached tree.
 */
export function stashCriteria(criteria: JourneyCriteria) {
  try {
    sessionStorage.setItem(WORKSPACE_KEY, JSON.stringify(criteria));
  } catch {
    // Storage can be unavailable (private mode, quota); the URL still carries it.
  }
  cachedSnapshot = criteria;
  try {
    window.dispatchEvent(new Event(CRITERIA_EVENT));
  } catch {
    // No window (server render): nothing to notify.
  }
}

export function readStashedCriteria(): JourneyCriteria | null {
  try {
    const raw = sessionStorage.getItem(WORKSPACE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<JourneyCriteria>;
    if (typeof parsed.from !== "string" || typeof parsed.to !== "string") {
      return null;
    }
    return {
      from: parsed.from,
      to: parsed.to,
      date:
        typeof parsed.date === "string" && parsed.date
          ? parsed.date
          : "2026-10-24",
      passengers: 1,
    };
  } catch {
    return null;
  }
}

/* Stable snapshot for `useSyncExternalStore`: pure reads must return the same
   reference until storage actually changes, or React re-renders in a loop. */
let cachedSnapshot: JourneyCriteria | null = null;

/** Server snapshot: prerendered markup never depends on the last search. */
export function readServerCriteria(): JourneyCriteria | null {
  return null;
}

export function readCriteriaSnapshot(): JourneyCriteria | null {
  try {
    const raw = sessionStorage.getItem(WORKSPACE_KEY);
    if (!raw) return (cachedSnapshot = null);
    const previous = cachedSnapshot ? JSON.stringify(cachedSnapshot) : null;
    if (raw !== previous) cachedSnapshot = JSON.parse(raw) as JourneyCriteria;
    return cachedSnapshot;
  } catch {
    return (cachedSnapshot = null);
  }
}

export function subscribeCriteria(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(CRITERIA_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CRITERIA_EVENT, onChange);
  };
}
