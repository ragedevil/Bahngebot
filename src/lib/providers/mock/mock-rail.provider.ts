import stationsData from "@/data/stations.json";
import { stationSchema } from "@/lib/validations/search";
import type {
  AnywhereSearchQuery,
  DACHCountry,
  DemandLevel,
  FareCategory,
  FareDay,
  IsoDate,
  JourneyOffer,
  RouteLeg,
  Station,
  StationId,
  StationRef,
  TrainProduct,
} from "@/types/rail";

import type { IRailDataProvider } from "../rail-provider.interface";

const STATIONS: readonly Station[] = stationSchema.array().parse(stationsData);
const STATION_BY_ID = new Map<StationId, Station>(
  STATIONS.map((station) => [station.id, station]),
);

const PROVIDER_ID = "mock";
const CURRENCY = "EUR" as const;
const TRANSFER_MINUTES = 20;
const DAY_MS = 86_400_000;
const DEPARTURE_TIMES = ["06:00", "09:00", "15:00", "18:00"] as const;
type DepartureTime = (typeof DEPARTURE_TIMES)[number];

const DAY_PRICE_FACTOR: readonly number[] = [
  0.9, // Sunday
  0.94, // Monday
  0.94, // Tuesday
  0.95, // Wednesday
  0.98, // Thursday
  1.15, // Friday
  0.96, // Saturday
];

const DEMAND_PRICE_FACTOR: Readonly<Record<DemandLevel, number>> = {
  LOW: 0.94,
  MEDIUM: 1,
  HIGH: 1.12,
};

const CATEGORY_PRICE_MULTIPLIER: Readonly<Record<FareCategory, number>> = {
  SUPER_SPARPREIS: 0.177,
  SPARPREIS: 0.4,
  FLEXPREIS: 1,
};

const COUNTRY_OPERATOR: Readonly<Record<DACHCountry, string>> = {
  DE: "DB Fernverkehr",
  AT: "ÖBB",
  CH: "SBB",
};

const ID = {
  berlin: "8011160",
  munich: "8000261",
  hamburg: "8002549",
  frankfurt: "8000105",
  cologne: "8000207",
  stuttgart: "8000096",
  duesseldorf: "8000085",
  leipzig: "8010205",
  hannover: "8000152",
  nuernberg: "8000284",
  dresden: "8010085",
  bremen: "8000050",
  dortmund: "8000080",
  essen: "8000098",
  mannheim: "8000244",
  karlsruhe: "8000191",
  freiburg: "8000107",
  muenster: "8000263",
  wien: "8103000",
  salzburg: "8100002",
  innsbruck: "8100108",
  linz: "8100013",
  zurich: "8503000",
  basel: "8500010",
  bern: "8507000",
} as const;

interface Corridor {
  readonly from: StationId;
  readonly to: StationId;
  readonly minutes: number;
}

const corridor = (
  from: StationId,
  to: StationId,
  minutes: number,
): Corridor => ({ from, to, minutes });

/**
 * Curated intercity corridors. Durations are typical fastest direct journey
 * times in minutes; multi-hop routes add a fixed transfer buffer.
 */
const CORRIDORS: readonly Corridor[] = [
  // Munich
  corridor(ID.munich, ID.berlin, 240),
  corridor(ID.munich, ID.frankfurt, 195),
  corridor(ID.munich, ID.salzburg, 100),
  corridor(ID.munich, ID.stuttgart, 135),
  corridor(ID.munich, ID.nuernberg, 65),
  corridor(ID.munich, ID.hamburg, 345),
  corridor(ID.munich, ID.cologne, 275),
  corridor(ID.munich, ID.duesseldorf, 310),
  corridor(ID.munich, ID.leipzig, 230),
  corridor(ID.munich, ID.hannover, 260),
  corridor(ID.munich, ID.dresden, 275),
  corridor(ID.munich, ID.bremen, 385),
  corridor(ID.munich, ID.dortmund, 330),
  corridor(ID.munich, ID.essen, 315),
  corridor(ID.munich, ID.mannheim, 170),
  corridor(ID.munich, ID.karlsruhe, 190),
  corridor(ID.munich, ID.freiburg, 235),
  corridor(ID.munich, ID.muenster, 360),
  corridor(ID.munich, ID.wien, 240),
  corridor(ID.munich, ID.innsbruck, 105),
  corridor(ID.munich, ID.linz, 195),
  corridor(ID.munich, ID.zurich, 230),
  corridor(ID.munich, ID.basel, 250),
  corridor(ID.munich, ID.bern, 280),

  // Berlin
  corridor(ID.berlin, ID.hamburg, 105),
  corridor(ID.berlin, ID.frankfurt, 240),
  corridor(ID.berlin, ID.cologne, 265),
  corridor(ID.berlin, ID.stuttgart, 330),
  corridor(ID.berlin, ID.duesseldorf, 280),
  corridor(ID.berlin, ID.leipzig, 75),
  corridor(ID.berlin, ID.hannover, 105),
  corridor(ID.berlin, ID.nuernberg, 180),
  corridor(ID.berlin, ID.dresden, 75),
  corridor(ID.berlin, ID.bremen, 195),
  corridor(ID.berlin, ID.dortmund, 240),
  corridor(ID.berlin, ID.essen, 255),
  corridor(ID.berlin, ID.mannheim, 255),
  corridor(ID.berlin, ID.karlsruhe, 300),
  corridor(ID.berlin, ID.freiburg, 380),
  corridor(ID.berlin, ID.muenster, 240),
  corridor(ID.berlin, ID.wien, 480),
  corridor(ID.berlin, ID.salzburg, 420),
  corridor(ID.berlin, ID.innsbruck, 480),
  corridor(ID.berlin, ID.linz, 450),
  corridor(ID.berlin, ID.zurich, 510),
  corridor(ID.berlin, ID.basel, 450),
  corridor(ID.berlin, ID.bern, 480),

  // Hamburg
  corridor(ID.hamburg, ID.hannover, 80),
  corridor(ID.hamburg, ID.bremen, 60),
  corridor(ID.hamburg, ID.cologne, 220),
  corridor(ID.hamburg, ID.frankfurt, 220),
  corridor(ID.hamburg, ID.dortmund, 180),
  corridor(ID.hamburg, ID.muenster, 150),
  corridor(ID.hamburg, ID.duesseldorf, 230),
  corridor(ID.hamburg, ID.leipzig, 230),

  // Frankfurt
  corridor(ID.frankfurt, ID.cologne, 65),
  corridor(ID.frankfurt, ID.stuttgart, 80),
  corridor(ID.frankfurt, ID.duesseldorf, 85),
  corridor(ID.frankfurt, ID.leipzig, 185),
  corridor(ID.frankfurt, ID.hannover, 130),
  corridor(ID.frankfurt, ID.nuernberg, 125),
  corridor(ID.frankfurt, ID.dresden, 260),
  corridor(ID.frankfurt, ID.bremen, 215),
  corridor(ID.frankfurt, ID.dortmund, 100),
  corridor(ID.frankfurt, ID.essen, 105),
  corridor(ID.frankfurt, ID.mannheim, 35),
  corridor(ID.frankfurt, ID.karlsruhe, 65),
  corridor(ID.frankfurt, ID.freiburg, 120),
  corridor(ID.frankfurt, ID.muenster, 160),
  corridor(ID.frankfurt, ID.wien, 390),
  corridor(ID.frankfurt, ID.salzburg, 300),
  corridor(ID.frankfurt, ID.innsbruck, 300),
  corridor(ID.frankfurt, ID.linz, 330),
  corridor(ID.frankfurt, ID.zurich, 225),
  corridor(ID.frankfurt, ID.basel, 165),
  corridor(ID.frankfurt, ID.bern, 240),

  // Cologne
  corridor(ID.cologne, ID.duesseldorf, 25),
  corridor(ID.cologne, ID.dortmund, 65),
  corridor(ID.cologne, ID.essen, 55),
  corridor(ID.cologne, ID.stuttgart, 135),
  corridor(ID.cologne, ID.hannover, 165),
  corridor(ID.cologne, ID.leipzig, 250),
  corridor(ID.cologne, ID.nuernberg, 210),
  corridor(ID.cologne, ID.dresden, 360),
  corridor(ID.cologne, ID.bremen, 190),
  corridor(ID.cologne, ID.mannheim, 105),
  corridor(ID.cologne, ID.karlsruhe, 135),
  corridor(ID.cologne, ID.freiburg, 190),
  corridor(ID.cologne, ID.muenster, 100),
  corridor(ID.cologne, ID.wien, 480),
  corridor(ID.cologne, ID.salzburg, 390),
  corridor(ID.cologne, ID.innsbruck, 390),
  corridor(ID.cologne, ID.linz, 420),
  corridor(ID.cologne, ID.zurich, 300),
  corridor(ID.cologne, ID.basel, 220),
  corridor(ID.cologne, ID.bern, 300),

  // Stuttgart
  corridor(ID.stuttgart, ID.duesseldorf, 120),
  corridor(ID.stuttgart, ID.leipzig, 240),
  corridor(ID.stuttgart, ID.hannover, 240),
  corridor(ID.stuttgart, ID.nuernberg, 105),
  corridor(ID.stuttgart, ID.dresden, 300),
  corridor(ID.stuttgart, ID.bremen, 285),
  corridor(ID.stuttgart, ID.dortmund, 145),
  corridor(ID.stuttgart, ID.essen, 160),
  corridor(ID.stuttgart, ID.mannheim, 35),
  corridor(ID.stuttgart, ID.karlsruhe, 35),
  corridor(ID.stuttgart, ID.freiburg, 85),
  corridor(ID.stuttgart, ID.muenster, 210),
  corridor(ID.stuttgart, ID.wien, 360),
  corridor(ID.stuttgart, ID.salzburg, 210),
  corridor(ID.stuttgart, ID.innsbruck, 210),
  corridor(ID.stuttgart, ID.linz, 270),
  corridor(ID.stuttgart, ID.zurich, 165),
  corridor(ID.stuttgart, ID.basel, 160),
  corridor(ID.stuttgart, ID.bern, 195),

  // Düsseldorf
  corridor(ID.duesseldorf, ID.leipzig, 290),
  corridor(ID.duesseldorf, ID.hannover, 145),
  corridor(ID.duesseldorf, ID.nuernberg, 235),
  corridor(ID.duesseldorf, ID.dresden, 380),
  corridor(ID.duesseldorf, ID.bremen, 175),
  corridor(ID.duesseldorf, ID.dortmund, 45),
  corridor(ID.duesseldorf, ID.essen, 30),
  corridor(ID.duesseldorf, ID.mannheim, 115),
  corridor(ID.duesseldorf, ID.karlsruhe, 145),
  corridor(ID.duesseldorf, ID.freiburg, 200),
  corridor(ID.duesseldorf, ID.muenster, 70),
  corridor(ID.duesseldorf, ID.wien, 510),
  corridor(ID.duesseldorf, ID.salzburg, 420),
  corridor(ID.duesseldorf, ID.innsbruck, 420),
  corridor(ID.duesseldorf, ID.linz, 450),
  corridor(ID.duesseldorf, ID.zurich, 330),
  corridor(ID.duesseldorf, ID.basel, 250),
  corridor(ID.duesseldorf, ID.bern, 330),

  // Leipzig
  corridor(ID.leipzig, ID.hannover, 150),
  corridor(ID.leipzig, ID.nuernberg, 165),
  corridor(ID.leipzig, ID.dresden, 75),
  corridor(ID.leipzig, ID.bremen, 230),
  corridor(ID.leipzig, ID.dortmund, 240),
  corridor(ID.leipzig, ID.essen, 255),
  corridor(ID.leipzig, ID.mannheim, 195),
  corridor(ID.leipzig, ID.karlsruhe, 230),
  corridor(ID.leipzig, ID.freiburg, 300),
  corridor(ID.leipzig, ID.muenster, 250),
  corridor(ID.leipzig, ID.wien, 390),
  corridor(ID.leipzig, ID.salzburg, 330),
  corridor(ID.leipzig, ID.innsbruck, 390),
  corridor(ID.leipzig, ID.linz, 360),
  corridor(ID.leipzig, ID.zurich, 390),
  corridor(ID.leipzig, ID.basel, 330),
  corridor(ID.leipzig, ID.bern, 360),

  // Hannover
  corridor(ID.hannover, ID.nuernberg, 195),
  corridor(ID.hannover, ID.dresden, 210),
  corridor(ID.hannover, ID.bremen, 60),
  corridor(ID.hannover, ID.dortmund, 80),
  corridor(ID.hannover, ID.essen, 95),
  corridor(ID.hannover, ID.mannheim, 170),
  corridor(ID.hannover, ID.karlsruhe, 205),
  corridor(ID.hannover, ID.freiburg, 275),
  corridor(ID.hannover, ID.muenster, 100),
  corridor(ID.hannover, ID.wien, 480),
  corridor(ID.hannover, ID.salzburg, 420),
  corridor(ID.hannover, ID.innsbruck, 450),
  corridor(ID.hannover, ID.linz, 450),
  corridor(ID.hannover, ID.zurich, 420),
  corridor(ID.hannover, ID.basel, 390),
  corridor(ID.hannover, ID.bern, 420),

  // Nürnberg
  corridor(ID.nuernberg, ID.dresden, 180),
  corridor(ID.nuernberg, ID.bremen, 300),
  corridor(ID.nuernberg, ID.dortmund, 240),
  corridor(ID.nuernberg, ID.essen, 255),
  corridor(ID.nuernberg, ID.mannheim, 105),
  corridor(ID.nuernberg, ID.karlsruhe, 135),
  corridor(ID.nuernberg, ID.freiburg, 210),
  corridor(ID.nuernberg, ID.muenster, 270),
  corridor(ID.nuernberg, ID.wien, 270),
  corridor(ID.nuernberg, ID.salzburg, 180),
  corridor(ID.nuernberg, ID.innsbruck, 255),
  corridor(ID.nuernberg, ID.linz, 240),
  corridor(ID.nuernberg, ID.zurich, 270),
  corridor(ID.nuernberg, ID.basel, 255),
  corridor(ID.nuernberg, ID.bern, 285),

  // Dresden
  corridor(ID.dresden, ID.bremen, 270),
  corridor(ID.dresden, ID.dortmund, 300),
  corridor(ID.dresden, ID.essen, 315),
  corridor(ID.dresden, ID.mannheim, 255),
  corridor(ID.dresden, ID.karlsruhe, 290),
  corridor(ID.dresden, ID.freiburg, 360),
  corridor(ID.dresden, ID.muenster, 315),
  corridor(ID.dresden, ID.wien, 420),
  corridor(ID.dresden, ID.salzburg, 360),
  corridor(ID.dresden, ID.innsbruck, 420),
  corridor(ID.dresden, ID.linz, 390),
  corridor(ID.dresden, ID.zurich, 450),
  corridor(ID.dresden, ID.basel, 390),
  corridor(ID.dresden, ID.bern, 420),

  // Bremen
  corridor(ID.bremen, ID.dortmund, 150),
  corridor(ID.bremen, ID.essen, 165),
  corridor(ID.bremen, ID.mannheim, 240),
  corridor(ID.bremen, ID.karlsruhe, 275),
  corridor(ID.bremen, ID.freiburg, 345),
  corridor(ID.bremen, ID.muenster, 75),
  corridor(ID.bremen, ID.wien, 540),
  corridor(ID.bremen, ID.salzburg, 480),
  corridor(ID.bremen, ID.innsbruck, 510),
  corridor(ID.bremen, ID.linz, 510),
  corridor(ID.bremen, ID.zurich, 480),
  corridor(ID.bremen, ID.basel, 450),
  corridor(ID.bremen, ID.bern, 480),

  // Dortmund
  corridor(ID.dortmund, ID.essen, 20),
  corridor(ID.dortmund, ID.mannheim, 130),
  corridor(ID.dortmund, ID.karlsruhe, 160),
  corridor(ID.dortmund, ID.freiburg, 225),
  corridor(ID.dortmund, ID.muenster, 45),
  corridor(ID.dortmund, ID.wien, 540),
  corridor(ID.dortmund, ID.salzburg, 450),
  corridor(ID.dortmund, ID.innsbruck, 450),
  corridor(ID.dortmund, ID.linz, 480),
  corridor(ID.dortmund, ID.zurich, 360),
  corridor(ID.dortmund, ID.basel, 300),
  corridor(ID.dortmund, ID.bern, 360),

  // Essen
  corridor(ID.essen, ID.mannheim, 145),
  corridor(ID.essen, ID.karlsruhe, 175),
  corridor(ID.essen, ID.freiburg, 235),
  corridor(ID.essen, ID.muenster, 55),
  corridor(ID.essen, ID.wien, 540),
  corridor(ID.essen, ID.salzburg, 450),
  corridor(ID.essen, ID.innsbruck, 450),
  corridor(ID.essen, ID.linz, 480),
  corridor(ID.essen, ID.zurich, 375),
  corridor(ID.essen, ID.basel, 315),
  corridor(ID.essen, ID.bern, 375),

  // Mannheim
  corridor(ID.mannheim, ID.karlsruhe, 30),
  corridor(ID.mannheim, ID.freiburg, 55),
  corridor(ID.mannheim, ID.muenster, 190),
  corridor(ID.mannheim, ID.wien, 420),
  corridor(ID.mannheim, ID.salzburg, 330),
  corridor(ID.mannheim, ID.innsbruck, 300),
  corridor(ID.mannheim, ID.linz, 360),
  corridor(ID.mannheim, ID.zurich, 195),
  corridor(ID.mannheim, ID.basel, 135),
  corridor(ID.mannheim, ID.bern, 210),

  // Karlsruhe
  corridor(ID.karlsruhe, ID.freiburg, 40),
  corridor(ID.karlsruhe, ID.muenster, 220),
  corridor(ID.karlsruhe, ID.wien, 450),
  corridor(ID.karlsruhe, ID.salzburg, 360),
  corridor(ID.karlsruhe, ID.innsbruck, 330),
  corridor(ID.karlsruhe, ID.linz, 390),
  corridor(ID.karlsruhe, ID.zurich, 165),
  corridor(ID.karlsruhe, ID.basel, 105),
  corridor(ID.karlsruhe, ID.bern, 180),

  // Freiburg
  corridor(ID.freiburg, ID.muenster, 260),
  corridor(ID.freiburg, ID.wien, 480),
  corridor(ID.freiburg, ID.salzburg, 390),
  corridor(ID.freiburg, ID.innsbruck, 360),
  corridor(ID.freiburg, ID.linz, 420),
  corridor(ID.freiburg, ID.zurich, 120),
  corridor(ID.freiburg, ID.basel, 45),
  corridor(ID.freiburg, ID.bern, 135),

  // Münster
  corridor(ID.muenster, ID.wien, 570),
  corridor(ID.muenster, ID.salzburg, 480),
  corridor(ID.muenster, ID.innsbruck, 480),
  corridor(ID.muenster, ID.linz, 510),
  corridor(ID.muenster, ID.zurich, 390),
  corridor(ID.muenster, ID.basel, 330),
  corridor(ID.muenster, ID.bern, 390),

  // Austria
  corridor(ID.wien, ID.salzburg, 145),
  corridor(ID.wien, ID.innsbruck, 255),
  corridor(ID.wien, ID.linz, 80),
  corridor(ID.wien, ID.zurich, 480),
  corridor(ID.wien, ID.basel, 510),
  corridor(ID.wien, ID.bern, 540),
  corridor(ID.salzburg, ID.innsbruck, 105),
  corridor(ID.salzburg, ID.linz, 70),
  corridor(ID.salzburg, ID.zurich, 330),
  corridor(ID.salzburg, ID.basel, 360),
  corridor(ID.salzburg, ID.bern, 390),
  corridor(ID.innsbruck, ID.linz, 180),
  corridor(ID.innsbruck, ID.zurich, 210),
  corridor(ID.innsbruck, ID.basel, 240),
  corridor(ID.innsbruck, ID.bern, 270),
  corridor(ID.linz, ID.zurich, 390),
  corridor(ID.linz, ID.basel, 420),
  corridor(ID.linz, ID.bern, 450),

  // Switzerland
  corridor(ID.zurich, ID.basel, 55),
  corridor(ID.zurich, ID.bern, 60),
  corridor(ID.basel, ID.bern, 55),
];

interface AdjacencyEntry {
  readonly stationId: StationId;
  readonly minutes: number;
}

const ADJACENCY = new Map<StationId, readonly AdjacencyEntry[]>();

{
  const neighbours = new Map<StationId, Map<StationId, number>>();
  for (const edge of CORRIDORS) {
    for (const [from, to] of [
      [edge.from, edge.to],
      [edge.to, edge.from],
    ] as const) {
      const entries = neighbours.get(from) ?? new Map<StationId, number>();
      const existing = entries.get(to);
      if (existing === undefined || edge.minutes < existing) {
        entries.set(to, edge.minutes);
      }
      neighbours.set(from, entries);
    }
  }

  for (const [stationId, entries] of neighbours) {
    ADJACENCY.set(
      stationId,
      [...entries.entries()]
        .map(([to, minutes]) => ({ stationId: to, minutes }))
        .sort((a, b) => a.stationId.localeCompare(b.stationId)),
    );
  }
}

export class UnknownStationError extends Error {
  constructor(stationId: string) {
    super(`Unknown station: ${stationId}`);
    this.name = "UnknownStationError";
  }
}

function requireStation(stationId: StationId): Station {
  const station = STATION_BY_ID.get(stationId);
  if (!station) throw new UnknownStationError(stationId);
  return station;
}

function toStationRef(station: Station): StationRef {
  return { id: station.id, name: station.name, slug: station.slug };
}

function parseDateParts(date: IsoDate): {
  year: number;
  month: number;
  day: number;
} {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) throw new RangeError(`Invalid date: ${date}`);

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const probe = new Date(Date.UTC(year, month - 1, day));
  if (
    probe.getUTCFullYear() !== year ||
    probe.getUTCMonth() !== month - 1 ||
    probe.getUTCDate() !== day
  ) {
    throw new RangeError(`Invalid date: ${date}`);
  }

  return { year, month, day };
}

function parseMonth(month: string): { year: number; month: number } {
  const match = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(month);
  if (!match) throw new RangeError(`Invalid month: ${month}`);
  return { year: Number(match[1]), month: Number(match[2]) };
}

function datesInRange(from: IsoDate, to: IsoDate): readonly IsoDate[] {
  const startParts = parseDateParts(from);
  const endParts = parseDateParts(to);
  const start = Date.UTC(
    startParts.year,
    startParts.month - 1,
    startParts.day,
  );
  const end = Date.UTC(endParts.year, endParts.month - 1, endParts.day);

  if (end < start) {
    throw new RangeError("departureDateTo must not be before departureDateFrom");
  }

  const dates: IsoDate[] = [];
  for (let cursor = start; cursor <= end; cursor += DAY_MS) {
    dates.push(new Date(cursor).toISOString().slice(0, 10));
  }
  return dates;
}

function datesInMonth(month: string): readonly IsoDate[] {
  const { year, month: monthNumber } = parseMonth(month);
  const daysInMonth = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  const dates: IsoDate[] = [];
  for (let day = 1; day <= daysInMonth; day += 1) {
    dates.push(
      `${year}-${String(monthNumber).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    );
  }
  return dates;
}

function lastSundayOfMonth(year: number, monthIndex: number): number {
  const lastDay = new Date(Date.UTC(year, monthIndex + 1, 0));
  return lastDay.getUTCDate() - lastDay.getUTCDay();
}

/** Central European summer time is active between the last Sundays of March and October. */
function berlinOffsetForDate(date: IsoDate): "+01:00" | "+02:00" {
  const { year, month, day } = parseDateParts(date);
  const summerStart = Date.UTC(year, 2, lastSundayOfMonth(year, 2), 1);
  const summerEnd = Date.UTC(year, 9, lastSundayOfMonth(year, 9), 1);
  const noon = Date.UTC(year, month - 1, day, 12);

  return noon >= summerStart && noon < summerEnd ? "+02:00" : "+01:00";
}

const BERLIN_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/Berlin",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

function toBerlinIso(instant: Date): string {
  const parts = BERLIN_FORMATTER.formatToParts(instant);
  const value = (type: Intl.DateTimeFormatPartTypes): string =>
    parts.find((part) => part.type === type)?.value ?? "";

  const date = `${value("year")}-${value("month")}-${value("day")}`;
  const time = `${value("hour")}:${value("minute")}:${value("second")}`;
  return `${date}T${time}${berlinOffsetForDate(date)}`;
}

function dayOfWeek(date: IsoDate): number {
  const { year, month, day } = parseDateParts(date);
  return new Date(Date.UTC(year, month - 1, day, 12)).getUTCDay();
}

type DemandProfile = {
  readonly demandLevel: DemandLevel;
  readonly priceFactor: number;
};

function demandProfileFor(date: IsoDate, time: DepartureTime): DemandProfile {
  const day = dayOfWeek(date);
  const hour = Number(time.slice(0, 2));
  const isWeekend = day === 0 || day === 6;

  let demandLevel: DemandLevel;
  if (day === 5 && hour >= 15 && hour < 19) {
    demandLevel = "HIGH";
  } else if (isWeekend) {
    demandLevel = hour >= 10 && hour < 18 ? "MEDIUM" : "LOW";
  } else if (hour < 7) {
    // Early weekday departures are deliberately off-peak in this model.
    demandLevel = "LOW";
  } else if (hour >= 15 && hour < 19) {
    demandLevel = "MEDIUM";
  } else if (hour >= 7 && hour < 10) {
    demandLevel = "MEDIUM";
  } else {
    demandLevel = "LOW";
  }

  const timeFactor =
    hour < 7 ? 0.72 : hour < 10 ? 1.02 : hour < 15 ? 0.96 : hour < 19 ? 1.18 : 0.9;

  return {
    demandLevel,
    priceFactor:
      DAY_PRICE_FACTOR[day] *
      timeFactor *
      DEMAND_PRICE_FACTOR[demandLevel],
  };
}

function defaultCategoryFor(demandLevel: DemandLevel): FareCategory {
  if (demandLevel === "LOW") return "SUPER_SPARPREIS";
  if (demandLevel === "MEDIUM") return "SPARPREIS";
  return "FLEXPREIS";
}

function roundFare(cents: number): number {
  return Math.max(499, Math.round(cents / 10) * 10 - 1);
}

function priceFor(
  durationMinutes: number,
  category: FareCategory,
  priceFactor: number,
  crossBorder: boolean,
): number {
  const baseFlexCents = 1_590 + durationMinutes * 60;
  const crossBorderFactor = crossBorder ? 1.08 : 1;
  return roundFare(
    baseFlexCents *
      CATEGORY_PRICE_MULTIPLIER[category] *
      priceFactor *
      crossBorderFactor,
  );
}

interface RouteHop {
  readonly from: StationId;
  readonly to: StationId;
  readonly minutes: number;
}

function estimateDurationMinutes(from: Station, to: Station): number {
  const earthRadiusKm = 6_371;
  const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;
  const deltaLat = toRadians(to.coordinates.lat - from.coordinates.lat);
  const deltaLng = toRadians(to.coordinates.lng - from.coordinates.lng);
  const lat1 = toRadians(from.coordinates.lat);
  const lat2 = toRadians(to.coordinates.lat);

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;
  const distanceKm =
    2 * earthRadiusKm * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.max(30, Math.ceil((distanceKm / 110) * 60 / 5) * 5);
}

/** Dijkstra over the curated corridor graph, with a deterministic tie-break. */
function findRoute(fromId: StationId, toId: StationId): readonly RouteHop[] {
  if (fromId === toId) return [];

  const distances = new Map<StationId, number>();
  const previous = new Map<StationId, AdjacencyEntry>();
  const unvisited = new Set<StationId>(STATIONS.map((station) => station.id));

  for (const stationId of unvisited) distances.set(stationId, Infinity);
  distances.set(fromId, 0);

  while (unvisited.size > 0) {
    let current: StationId | undefined;
    let currentDistance = Infinity;

    for (const stationId of unvisited) {
      const distance = distances.get(stationId) ?? Infinity;
      if (
        distance < currentDistance ||
        (distance === currentDistance &&
          current !== undefined &&
          stationId < current)
      ) {
        current = stationId;
        currentDistance = distance;
      }
    }

    if (current === undefined || currentDistance === Infinity) break;
    if (current === toId) break;
    unvisited.delete(current);

    for (const neighbour of ADJACENCY.get(current) ?? []) {
      if (!unvisited.has(neighbour.stationId)) continue;

      const transferPenalty =
        current === fromId ? 0 : TRANSFER_MINUTES;
      const candidate =
        currentDistance + neighbour.minutes + transferPenalty;
      if (candidate < (distances.get(neighbour.stationId) ?? Infinity)) {
        distances.set(neighbour.stationId, candidate);
        previous.set(neighbour.stationId, {
          stationId: current,
          minutes: neighbour.minutes,
        });
      }
    }
  }

  if (!previous.has(toId)) {
    const from = requireStation(fromId);
    const to = requireStation(toId);
    return [
      {
        from: fromId,
        to: toId,
        minutes: estimateDurationMinutes(from, to),
      },
    ];
  }

  const hops: RouteHop[] = [];
  let cursor = toId;

  while (cursor !== fromId) {
    const step = previous.get(cursor);
    if (!step) {
      const from = requireStation(fromId);
      const to = requireStation(toId);
      return [
        {
          from: fromId,
          to: toId,
          minutes: estimateDurationMinutes(from, to),
        },
      ];
    }

    hops.push({
      from: step.stationId,
      to: cursor,
      minutes: step.minutes,
    });
    cursor = step.stationId;
  }

  return hops.reverse();
}

function hashString(value: string): number {
  let hash = 2_166_136_261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16_777_619);
  }
  return hash >>> 0;
}

interface TrainMetadata {
  readonly line: string;
  readonly product: TrainProduct;
  readonly operator: string;
}

const TRAIN_METADATA = new Map<string, TrainMetadata>();

function trainMetadataFor(
  from: Station,
  to: Station,
  minutes: number,
): TrainMetadata {
  const key = [from.id, to.id].sort().join("|");
  const cached = TRAIN_METADATA.get(key);
  if (cached) return cached;

  let product: TrainProduct;
  if (minutes <= 45) {
    product = "RE";
  } else if (from.country === "AT" || to.country === "AT") {
    product = minutes <= 120 ? "EC" : "RJ";
  } else if (from.country === "CH" || to.country === "CH") {
    product = minutes <= 120 ? "IC" : "EC";
  } else if (minutes <= 90) {
    product = "RE";
  } else if (minutes <= 150) {
    product = "IC";
  } else {
    product = "ICE";
  }

  const operators =
    from.country === to.country
      ? [COUNTRY_OPERATOR[from.country]]
      : [
          COUNTRY_OPERATOR[from.country],
          COUNTRY_OPERATOR[to.country],
        ].filter(
          (operator, index, all) => all.indexOf(operator) === index,
        );

  const metadata: TrainMetadata = {
    product,
    operator: operators.join(" / "),
    line: `${product} ${100 + (hashString(key) % 900)}`,
  };

  TRAIN_METADATA.set(key, metadata);
  return metadata;
}

interface BuiltJourney {
  readonly legs: readonly RouteLeg[];
  readonly arrival: Date;
}

function buildJourney(
  path: readonly RouteHop[],
  departure: Date,
): BuiltJourney {
  const legs: RouteLeg[] = [];
  let cursor = departure.getTime();

  for (let index = 0; index < path.length; index += 1) {
    const hop = path[index];
    const from = requireStation(hop.from);
    const to = requireStation(hop.to);
    const metadata = trainMetadataFor(from, to, hop.minutes);
    const legDeparture = new Date(cursor);
    const legArrival = new Date(cursor + hop.minutes * 60_000);

    legs.push({
      kind: "train",
      origin: toStationRef(from),
      destination: toStationRef(to),
      departure: toBerlinIso(legDeparture),
      arrival: toBerlinIso(legArrival),
      durationMinutes: hop.minutes,
      line: metadata.line,
      product: metadata.product,
      operator: metadata.operator,
      direction: to.name,
    });

    cursor = legArrival.getTime();

    if (index < path.length - 1) {
      const transferDeparture = new Date(cursor);
      const transferArrival = new Date(cursor + TRANSFER_MINUTES * 60_000);

      legs.push({
        kind: "transfer",
        station: toStationRef(to),
        departure: toBerlinIso(transferDeparture),
        arrival: toBerlinIso(transferArrival),
        durationMinutes: TRANSFER_MINUTES,
        walkMinutes: 5,
      });

      cursor = transferArrival.getTime();
    }
  }

  return { legs, arrival: new Date(cursor) };
}

function bookingDeepLink(
  origin: Station,
  destination: Station,
  date: IsoDate,
  time: DepartureTime,
): string {
  const params: ReadonlyArray<readonly [string, string]> = [
    ["sts", "true"],
    ["so", origin.name],
    ["zo", destination.name],
    ["kl", "2"],
    ["r", "13:16:KLASSENLOS:1"],
    ["hd", `${date}T${time}:00`],
    ["hza", "D"],
  ];

  return `https://www.bahn.de/buchung/fahrplan/suche#${params
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&")}`;
}

interface OfferInput {
  readonly origin: Station;
  readonly destination: Station;
  readonly path: readonly RouteHop[];
  readonly date: IsoDate;
  readonly time: DepartureTime;
  readonly category: FareCategory;
  readonly demandLevel: DemandLevel;
}

function createOffer(input: OfferInput): JourneyOffer {
  const {
    origin,
    destination,
    path,
    date,
    time,
    category,
    demandLevel,
  } = input;
  const offset = berlinOffsetForDate(date);
  const departure = new Date(`${date}T${time}:00${offset}`);
  const built = buildJourney(path, departure);
  const durationMinutes = Math.round(
    (built.arrival.getTime() - departure.getTime()) / 60_000,
  );
  const profile = demandProfileFor(date, time);
  const priceInCents = priceFor(
    durationMinutes,
    category,
    profile.priceFactor,
    origin.country !== destination.country,
  );
  const seed = hashString(
    `${origin.id}:${destination.id}:${date}:${time}:${category}`,
  );
  const seatsAvailable =
    category === "FLEXPREIS"
      ? 30 + (seed % 40)
      : category === "SPARPREIS"
        ? 10 + (seed % 20)
        : 3 + (seed % 8);

  return {
    id: `${PROVIDER_ID}:${origin.id}:${destination.id}:${date}:${time}:${category}`,
    provider: PROVIDER_ID,
    legs: built.legs,
    origin: toStationRef(origin),
    destination: toStationRef(destination),
    departure: built.legs[0].departure,
    arrival: built.legs[built.legs.length - 1].arrival,
    durationMinutes,
    transfers: path.length - 1,
    priceInCents,
    currency: CURRENCY,
    category,
    demandLevel,
    bookingDeepLink: bookingDeepLink(origin, destination, date, time),
    seatsAvailable,
    soldOut: false,
  };
}

function matchesFilters(
  offer: JourneyOffer,
  filter: AnywhereSearchQuery,
): boolean {
  if (
    filter.maxPriceInCents !== undefined &&
    offer.priceInCents > filter.maxPriceInCents
  ) {
    return false;
  }

  if (
    filter.maxTransfers !== undefined &&
    offer.transfers > filter.maxTransfers
  ) {
    return false;
  }

  if (
    filter.maxDurationMinutes !== undefined &&
    offer.durationMinutes > filter.maxDurationMinutes
  ) {
    return false;
  }

  if (
    filter.demandLevels !== undefined &&
    !filter.demandLevels.includes(offer.demandLevel)
  ) {
    return false;
  }

  return true;
}

function sortOffers(
  offers: readonly JourneyOffer[],
  sortBy: AnywhereSearchQuery["sortBy"],
): JourneyOffer[] {
  return [...offers].sort((a, b) => {
    switch (sortBy) {
      case "PRICE_ASC":
        return (
          a.priceInCents - b.priceInCents ||
          Date.parse(a.departure) - Date.parse(b.departure) ||
          a.id.localeCompare(b.id)
        );
      case "DEPARTURE_ASC":
        return (
          Date.parse(a.departure) - Date.parse(b.departure) ||
          a.priceInCents - b.priceInCents ||
          a.id.localeCompare(b.id)
        );
      case "DURATION_ASC":
        return (
          a.durationMinutes - b.durationMinutes ||
          a.priceInCents - b.priceInCents ||
          a.id.localeCompare(b.id)
        );
      case "BEST":
        return (
          a.priceInCents +
            a.durationMinutes * 25 -
            (b.priceInCents + b.durationMinutes * 25) ||
          Date.parse(a.departure) - Date.parse(b.departure) ||
          a.id.localeCompare(b.id)
        );
    }
  });
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function foldGerman(value: string): string {
  return normalizeText(
    value.normalize("NFKD").replace(/[\u0300-\u036f]/g, ""),
  );
}

function transliterateGerman(value: string): string {
  return normalizeText(
    value
      .toLowerCase()
      .replace(/ä/g, "ae")
      .replace(/ö/g, "oe")
      .replace(/ü/g, "ue")
      .replace(/ß/g, "ss")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, ""),
  );
}

function searchVariants(query: string): readonly string[] {
  return [...new Set([foldGerman(query), transliterateGerman(query)])].filter(
    (variant) => variant.length > 0,
  );
}

function stationScore(station: Station, query: string): number {
  const rawQuery = query.trim().toLowerCase();

  if (station.id === rawQuery) return 0;
  if (/^\d+$/.test(rawQuery) && station.id.startsWith(rawQuery)) return 1;

  const variants = searchVariants(query);
  if (variants.length === 0) return Infinity;

  const names = [foldGerman(station.name), transliterateGerman(station.name)];
  const cities = [foldGerman(station.city), transliterateGerman(station.city)];

  const anyName = (predicate: (value: string) => boolean): boolean =>
    names.some(predicate);
  const anyCity = (predicate: (value: string) => boolean): boolean =>
    cities.some(predicate);
  const anyVariant = (predicate: (value: string) => boolean): boolean =>
    variants.some(predicate);

  if (anyVariant((variant) => anyName((name) => name === variant))) return 2;
  if (anyVariant((variant) => station.slug === variant)) return 3;
  if (anyVariant((variant) => anyName((name) => name.startsWith(variant))))
    return 4;
  if (anyVariant((variant) => anyCity((city) => city === variant))) return 5;
  if (anyVariant((variant) => anyCity((city) => city.startsWith(variant))))
    return 6;
  if (anyVariant((variant) => anyName((name) => name.includes(variant))))
    return 7;
  if (anyVariant((variant) => anyCity((city) => city.includes(variant))))
    return 8;

  return Infinity;
}

/**
 * Deterministic mock provider. No network access, timers, or random jitter:
 * the same query always produces byte-for-byte identical offers.
 */
export class MockRailProvider implements IRailDataProvider {
  async searchAnywhere(
    filter: AnywhereSearchQuery,
  ): Promise<JourneyOffer[]> {
    const fixedId =
      filter.mode === "from"
        ? filter.originStationId
        : filter.destinationStationId;
    const fixedStation = requireStation(fixedId);
    const dates = datesInRange(
      filter.departureDateFrom,
      filter.departureDateTo,
    );
    const offers: JourneyOffer[] = [];

    for (const candidate of STATIONS) {
      if (candidate.id === fixedStation.id) continue;

      const origin = filter.mode === "from" ? fixedStation : candidate;
      const destination =
        filter.mode === "from" ? candidate : fixedStation;
      const path = findRoute(origin.id, destination.id);
      if (path.length === 0) continue;

      for (const date of dates) {
        for (const time of DEPARTURE_TIMES) {
          const profile = demandProfileFor(date, time);
          const categories =
            filter.categories && filter.categories.length > 0
              ? [...new Set(filter.categories)]
              : [defaultCategoryFor(profile.demandLevel)];

          for (const category of categories) {
            const offer = createOffer({
              origin,
              destination,
              path,
              date,
              time,
              category,
              demandLevel: profile.demandLevel,
            });

            if (matchesFilters(offer, filter)) offers.push(offer);
          }
        }
      }
    }

    return sortOffers(offers, filter.sortBy).slice(
      0,
      Math.max(0, filter.limit),
    );
  }

  async getFareCalendar(
    originId: string,
    destId: string,
    month: string,
  ): Promise<FareDay[]> {
    const origin = requireStation(originId);
    const destination = requireStation(destId);
    if (origin.id === destination.id) return [];

    const path = findRoute(origin.id, destination.id);
    if (path.length === 0) return [];

    return datesInMonth(month).map((date) => {
      const offers = DEPARTURE_TIMES.map((time) => {
        const profile = demandProfileFor(date, time);
        const category = defaultCategoryFor(profile.demandLevel);
        return createOffer({
          origin,
          destination,
          path,
          date,
          time,
          category,
          demandLevel: profile.demandLevel,
        });
      });
      const cheapest = offers.reduce((best, offer) =>
        offer.priceInCents < best.priceInCents ? offer : best,
      );

      return {
        date,
        priceInCents: cheapest.priceInCents,
        currency: CURRENCY,
        category: cheapest.category,
        demandLevel: cheapest.demandLevel,
        available: true,
      };
    });
  }

  async resolveStation(query: string): Promise<Station[]> {
    const trimmed = query.trim();
    if (trimmed.length === 0) {
      return STATIONS.filter((station) => station.popularHub).slice(0, 10);
    }

    return STATIONS.map((station) => ({
      station,
      score: stationScore(station, trimmed),
    }))
      .filter(
        (entry): entry is { station: Station; score: number } =>
          Number.isFinite(entry.score),
      )
      .sort(
        (a, b) =>
          a.score - b.score ||
          Number(b.station.popularHub) - Number(a.station.popularHub) ||
          a.station.name.localeCompare(b.station.name),
      )
      .map((entry) => entry.station);
  }
}

export const mockRailProvider: IRailDataProvider = new MockRailProvider();

export default MockRailProvider;
