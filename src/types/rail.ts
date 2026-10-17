/**
 * Core rail-domain types for bahngebot.
 *
 * These types are the contract between data providers (mock, DB, ÖBB, SBB,
 * future partners) and the rest of the application. Provider adapters are
 * responsible for mapping their payloads into these shapes; API routes and UI
 * code should never depend on provider-specific fields.
 */

/** Deutsche Bahn EVA / IBNR station number, e.g. `8000261`. */
export type StationId = string;

/** ISO-8601 date string (`YYYY-MM-DD`), without a time component. */
export type IsoDate = string;

/** ISO-8601 calendar month (`YYYY-MM`). */
export type IsoMonth = string;

/** ISO-8601 timestamp with an explicit UTC offset or `Z`, e.g. `2026-10-17T08:30:00+02:00`. */
export type IsoDateTime = string;

/** Absolute URL that starts the booking flow for a specific offer. */
export type BookingDeepLink = string;

/** Identifier of the provider that produced an offer (e.g. `mock`, `db`, `oebb`, `sbb`). */
export type ProviderId = string;

export const DACH_COUNTRIES = ["DE", "AT", "CH"] as const;
export type DACHCountry = (typeof DACH_COUNTRIES)[number];

export const FARE_CATEGORIES = [
  "SUPER_SPARPREIS",
  "SPARPREIS",
  "FLEXPREIS",
] as const;
export type FareCategory = (typeof FARE_CATEGORIES)[number];

export const DEMAND_LEVELS = ["LOW", "MEDIUM", "HIGH"] as const;
export type DemandLevel = (typeof DEMAND_LEVELS)[number];

export const TRAIN_PRODUCTS = [
  "ICE",
  "IC",
  "EC",
  "EN",
  "NJ",
  "RJ",
  "RE",
  "RB",
  "S",
  "MEX",
  "WESTBAHN",
] as const;
export type TrainProduct = (typeof TRAIN_PRODUCTS)[number];

export const JOURNEY_SORTS = [
  "BEST",
  "PRICE_ASC",
  "DEPARTURE_ASC",
  "DURATION_ASC",
] as const;
export type JourneySort = (typeof JOURNEY_SORTS)[number];

/** Only EUR is offered in the DACH launch market. */
export type CurrencyCode = "EUR";

export interface GeoCoordinates {
  readonly lat: number;
  readonly lng: number;
}

/** The subset of a station that is embedded in legs and offers. */
export interface StationRef {
  readonly id: StationId;
  readonly name: string;
  readonly slug: string;
}

export interface Station extends StationRef {
  readonly city: string;
  readonly country: DACHCountry;
  readonly coordinates: GeoCoordinates;
  /** Whether the station is part of the curated discovery / quick-pick set. */
  readonly popularHub: boolean;
}

interface RouteLegBase {
  readonly departure: IsoDateTime;
  readonly arrival: IsoDateTime;
  readonly durationMinutes: number;
}

export interface TrainLeg extends RouteLegBase {
  readonly kind: "train";
  readonly origin: StationRef;
  readonly destination: StationRef;
  /** Marketing line name, e.g. `ICE 574` or `RJ 83`. */
  readonly line: string;
  readonly product: TrainProduct;
  readonly operator: string;
  /** Headsign shown at the platform, when provided by the source. */
  readonly direction?: string;
  readonly departurePlatform?: string;
  readonly arrivalPlatform?: string;
  readonly cancelled?: boolean;
}

/** A change of train at a station, optionally including the walking time. */
export interface TransferLeg {
  readonly kind: "transfer";
  readonly station: StationRef;
  readonly departure: IsoDateTime;
  readonly arrival: IsoDateTime;
  readonly durationMinutes: number;
  readonly walkMinutes?: number;
}

export type RouteLeg = TrainLeg | TransferLeg;

/**
 * A bookable journey. `transfers` is the number of changes (not the number of
 * legs), so a direct train has `transfers: 0`.
 */
export interface JourneyOffer {
  readonly id: string;
  readonly provider: ProviderId;
  readonly legs: readonly RouteLeg[];
  readonly origin: StationRef;
  readonly destination: StationRef;
  readonly departure: IsoDateTime;
  readonly arrival: IsoDateTime;
  readonly durationMinutes: number;
  readonly transfers: number;
  readonly priceInCents: number;
  readonly currency: CurrencyCode;
  readonly category: FareCategory;
  readonly demandLevel: DemandLevel;
  readonly bookingDeepLink: BookingDeepLink;
  readonly seatsAvailable?: number | null;
  readonly soldOut?: boolean;
}

export const ANYWHERE_SEARCH_MODES = ["from", "to"] as const;
export type AnywhereSearchMode = (typeof ANYWHERE_SEARCH_MODES)[number];

/** Filters shared by all discovery searches. */
export interface SearchFilters {
  readonly departureDateFrom: IsoDate;
  readonly departureDateTo: IsoDate;
  readonly passengers: number;
  readonly maxPriceInCents?: number;
  readonly maxTransfers?: number;
  readonly maxDurationMinutes?: number;
  readonly categories?: readonly FareCategory[];
  readonly demandLevels?: readonly DemandLevel[];
  readonly sortBy: JourneySort;
  readonly limit: number;
}

interface AnywhereSearchBase extends SearchFilters {
  readonly mode: AnywhereSearchMode;
}

/** Search a date window for journeys departing from a fixed origin. */
export interface FromAnywhereSearchQuery extends AnywhereSearchBase {
  readonly mode: "from";
  readonly originStationId: StationId;
  readonly destinationStationId?: never;
}

/** Search a date window for journeys arriving at a fixed destination. */
export interface ToAnywhereSearchQuery extends AnywhereSearchBase {
  readonly mode: "to";
  readonly destinationStationId: StationId;
  readonly originStationId?: never;
}

/**
 * Discovery query where exactly one endpoint is fixed and the other is
 * "anywhere". The `mode` discriminator makes that invariant explicit.
 */
export type AnywhereSearchQuery =
  | FromAnywhereSearchQuery
  | ToAnywhereSearchQuery;

/** Cheapest available fare per day for a fixed route and calendar month. */
export interface FareCalendarQuery {
  readonly originStationId: StationId;
  readonly destinationStationId: StationId;
  readonly month: IsoMonth;
  readonly passengers: number;
  readonly maxPriceInCents?: number;
  readonly maxTransfers?: number;
  readonly categories?: readonly FareCategory[];
}

/** One day of a fare calendar. */
export interface FareDay {
  readonly date: IsoDate;
  readonly priceInCents: number;
  readonly currency: CurrencyCode;
  readonly category: FareCategory;
  readonly demandLevel: DemandLevel;
  readonly available: boolean;
}
