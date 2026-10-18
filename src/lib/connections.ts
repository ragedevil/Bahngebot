import { MOCK_CONNECTIONS } from "@/data/mockConnections";
import type { Leg, TrainConnection } from "@/types/connection";

/** What the UI hands back to the caller after a search was resolved. */
export interface ConnectionResults {
  connections: TrainConnection[];
  source: "api" | "mock";
}

const EMPTY_LEG: Leg = {
  id: "leg-unknown",
  trainType: "ICE",
  trainNumber: "Rail",
  departureStation: "",
  departureTime: "",
  arrivalStation: "",
  arrivalTime: "",
  duration: "",
};

const text = (value: unknown, fallback = ""): string =>
  typeof value === "string" && value.trim() ? value : fallback;

const number = (value: unknown, fallback = 0): number => {
  const parsed =
    typeof value === "number" ? value : Number.parseFloat(String(value ?? ""));
  return Number.isFinite(parsed) ? parsed : fallback;
};

/** "3:54" / "3h 54m" / "3h" → "3h 54m". */
function normaliseDuration(value: unknown, fallback = ""): string {
  const raw = text(value);
  const colon = raw.match(/^(\d+):(\d{2})$/);
  if (colon) return `${colon[1]}h ${colon[2]}m`;
  return raw || fallback;
}

function normaliseLeg(value: unknown, index: number): Leg {
  const leg = (value ?? {}) as Record<string, unknown>;
  const trainType = text(leg.trainType, EMPTY_LEG.trainType).toUpperCase();

  return {
    id: text(leg.id, `leg-${index}`),
    trainType: (
      ["ICE", "IC", "RE", "RB", "EC"].includes(trainType) ? trainType : "ICE"
    ) as Leg["trainType"],
    trainNumber: text(leg.trainNumber, "Rail"),
    departureStation: text(leg.departureStation),
    departureTime: text(leg.departureTime),
    arrivalStation: text(leg.arrivalStation),
    arrivalTime: text(leg.arrivalTime),
    duration: normaliseDuration(leg.duration, EMPTY_LEG.duration),
    platform: text(leg.platform) || undefined,
  };
}

/**
 * Turn whatever the API (or a cached payload) produced into a connection the
 * cards can render without a per-field crash. Anything unrecognisable is
 * dropped rather than rendered half-empty.
 */
function normaliseConnection(
  value: unknown,
  index: number,
): TrainConnection | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;

  const departureStation = text(item.departureStation ?? item.from);
  const arrivalStation = text(item.arrivalStation ?? item.to);
  const departureTime = text(item.departureTime);
  if (!departureStation || !arrivalStation || !departureTime) return null;

  const rawLegs = Array.isArray(item.legs) ? item.legs : [];
  const legs = rawLegs.map(normaliseLeg);
  const firstLeg = legs[0] ?? EMPTY_LEG;

  const rawTrainTypes = Array.isArray(item.trainTypes) ? item.trainTypes : [];
  const trainTypes = (
    rawTrainTypes.length > 0 ? rawTrainTypes : [firstLeg.trainType]
  )
    .map((entry) => text(entry))
    .filter(Boolean);

  const price = number(item.price, NaN);
  if (!Number.isFinite(price)) return null;

  return {
    id: text(item.id, `conn-${index}`),
    departureTime,
    arrivalTime: text(item.arrivalTime, firstLeg.arrivalTime),
    departureStation,
    arrivalStation,
    duration: normaliseDuration(item.duration, firstLeg.duration || "—"),
    transfers: Math.max(0, number(item.transfers, Math.max(legs.length - 1, 0))),
    price,
    originalPrice:
      typeof item.originalPrice === "undefined"
        ? undefined
        : number(item.originalPrice),
    dealTag: item.dealTag as TrainConnection["dealTag"],
    trainTypes,
    legs,
    punctualityScore:
      typeof item.punctualityScore === "undefined"
        ? undefined
        : number(item.punctualityScore),
    ecoSaverKgCO2:
      typeof item.ecoSaverKgCO2 === "undefined"
        ? undefined
        : number(item.ecoSaverKgCO2),
    availableSeats: ["High", "Medium", "Low"].includes(
      text(item.availableSeats),
    )
      ? (item.availableSeats as TrainConnection["availableSeats"])
      : "Medium",
    date: text(item.date, ""),
  };
}

/**
 * Fetch connections for a route, falling back to the bundled mock set on any
 * failure (network error, non-2xx, empty or malformed payload). The results
 * list must never be left empty just because the API is.
 */
export async function fetchConnections(
  criteria: { from: string; to: string; date: string },
  signal?: AbortSignal,
): Promise<ConnectionResults> {
  try {
    const params = new URLSearchParams({
      from: criteria.from,
      to: criteria.to,
      date: criteria.date,
    });
    // No fares provider is wired up yet, so this 404s → mock fallback. Wiring
    // a real API later only has to honour this response shape.
    const response = await fetch(`/api/connections?${params.toString()}`, {
      signal,
      cache: "no-store",
    });

    if (response.ok) {
      const payload: unknown = await response.json();
      const raw = Array.isArray(payload)
        ? payload
        : Array.isArray((payload as { connections?: unknown })?.connections)
          ? (payload as { connections: unknown[] }).connections
          : [];

      const connections = raw
        .map(normaliseConnection)
        .filter((connection): connection is TrainConnection => connection !== null);

      if (connections.length > 0) {
        return { connections, source: "api" };
      }
    }
  } catch {
    // Aborted or unreachable: the mock fallback below still fills the list.
  }

  return { connections: MOCK_CONNECTIONS, source: "mock" };
}

/** Fallback used wherever a synchronous seed is needed. */
export function fallbackConnections(): TrainConnection[] {
  return MOCK_CONNECTIONS;
}
