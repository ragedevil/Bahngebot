import { z } from "zod";

import {
  DACH_COUNTRIES,
  DEMAND_LEVELS,
  FARE_CATEGORIES,
  JOURNEY_SORTS,
  TRAIN_PRODUCTS,
  type AnywhereSearchQuery,
  type FareCalendarQuery,
  type FareDay,
  type GeoCoordinates,
  type JourneyOffer,
  type RouteLeg,
  type Station,
  type StationRef,
  type TransferLeg,
  type TrainLeg,
} from "@/types/rail";

/**
 * Validation schemas for API boundaries.
 *
 * The schemas accept both native JSON values and flat query-string values
 * (`Object.fromEntries(searchParams)`): numbers are coerced, and enum lists may
 * be arrays or comma-separated strings (`?categories=SPARPREIS,FLEXPREIS`).
 */

const STATION_ID_PATTERN = /^\d{7}$/;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ISO_MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

export const stationIdSchema = z
  .string()
  .regex(STATION_ID_PATTERN, "Station id must be a 7-digit EVA/IBNR number");

export const isoDateSchema = z.iso.date();
export const isoMonthSchema = z
  .string()
  .regex(ISO_MONTH_PATTERN, "Month must use the YYYY-MM format");
export const isoDateTimeSchema = z.iso.datetime({ offset: true });
export const bookingDeepLinkSchema = z
  .url()
  .refine(
    (value) => value.startsWith("https://") || value.startsWith("http://"),
    "Booking deep link must be an absolute http(s) URL",
  );

export const geoCoordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
}) satisfies z.ZodType<GeoCoordinates>;

export const stationRefSchema = z.object({
  id: stationIdSchema,
  name: z.string().trim().min(1).max(120),
  slug: z.string().regex(SLUG_PATTERN, "Slug must be lowercase kebab-case"),
}) satisfies z.ZodType<StationRef>;

export const stationSchema = z.object({
  id: stationIdSchema,
  name: z.string().trim().min(1).max(120),
  slug: z.string().regex(SLUG_PATTERN, "Slug must be lowercase kebab-case"),
  city: z.string().trim().min(1).max(100),
  country: z.enum(DACH_COUNTRIES),
  coordinates: geoCoordinatesSchema,
  popularHub: z.boolean(),
}) satisfies z.ZodType<Station>;

const durationMinutesSchema = z.number().int().positive();

export const trainLegSchema = z.object({
  kind: z.literal("train"),
  origin: stationRefSchema,
  destination: stationRefSchema,
  departure: isoDateTimeSchema,
  arrival: isoDateTimeSchema,
  durationMinutes: durationMinutesSchema,
  line: z.string().trim().min(1).max(40),
  product: z.enum(TRAIN_PRODUCTS),
  operator: z.string().trim().min(1).max(80),
  direction: z.string().trim().min(1).max(120).optional(),
  departurePlatform: z.string().trim().min(1).max(20).optional(),
  arrivalPlatform: z.string().trim().min(1).max(20).optional(),
  cancelled: z.boolean().optional(),
}) satisfies z.ZodType<TrainLeg>;

export const transferLegSchema = z.object({
  kind: z.literal("transfer"),
  station: stationRefSchema,
  departure: isoDateTimeSchema,
  arrival: isoDateTimeSchema,
  durationMinutes: durationMinutesSchema,
  walkMinutes: durationMinutesSchema.optional(),
}) satisfies z.ZodType<TransferLeg>;

export const routeLegSchema = z.discriminatedUnion("kind", [
  trainLegSchema,
  transferLegSchema,
]) satisfies z.ZodType<RouteLeg>;

export const journeyOfferSchema = z
  .object({
    id: z.string().trim().min(1).max(128),
    provider: z.string().trim().min(1).max(64),
    legs: z.array(routeLegSchema).min(1),
    origin: stationRefSchema,
    destination: stationRefSchema,
    departure: isoDateTimeSchema,
    arrival: isoDateTimeSchema,
    durationMinutes: durationMinutesSchema,
    transfers: z.number().int().nonnegative(),
    priceInCents: z.number().int().nonnegative(),
    currency: z.literal("EUR"),
    category: z.enum(FARE_CATEGORIES),
    demandLevel: z.enum(DEMAND_LEVELS),
    bookingDeepLink: bookingDeepLinkSchema,
    seatsAvailable: z.number().int().nonnegative().nullable().optional(),
    soldOut: z.boolean().optional(),
  })
  .superRefine((offer, ctx) => {
    if (Date.parse(offer.arrival) < Date.parse(offer.departure)) {
      ctx.addIssue({
        code: "custom",
        path: ["arrival"],
        message: "Arrival must not be before departure",
      });
    }

    const trainLegs = offer.legs.filter(
      (leg): leg is TrainLeg => leg.kind === "train",
    );

    if (trainLegs.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["legs"],
        message: "A journey offer must contain at least one train leg",
      });
      return;
    }

    if (trainLegs[0].origin.id !== offer.origin.id) {
      ctx.addIssue({
        code: "custom",
        path: ["origin"],
        message: "Offer origin must match the first train leg",
      });
    }

    const lastTrainLeg = trainLegs[trainLegs.length - 1];
    if (lastTrainLeg.destination.id !== offer.destination.id) {
      ctx.addIssue({
        code: "custom",
        path: ["destination"],
        message: "Offer destination must match the last train leg",
      });
    }

    const expectedTransfers = trainLegs.length - 1;
    if (offer.transfers !== expectedTransfers) {
      ctx.addIssue({
        code: "custom",
        path: ["transfers"],
        message: `Expected ${expectedTransfers} transfers for ${trainLegs.length} train legs`,
      });
    }

    const firstLeg = offer.legs[0];
    const lastLeg = offer.legs[offer.legs.length - 1];
    if (Date.parse(firstLeg.departure) !== Date.parse(offer.departure)) {
      ctx.addIssue({
        code: "custom",
        path: ["departure"],
        message: "Offer departure must match the first leg",
      });
    }
    if (Date.parse(lastLeg.arrival) !== Date.parse(offer.arrival)) {
      ctx.addIssue({
        code: "custom",
        path: ["arrival"],
        message: "Offer arrival must match the last leg",
      });
    }
  }) satisfies z.ZodType<JourneyOffer>;

const optionalNonNegativeIntegerSchema = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.coerce.number().int().nonnegative().optional(),
);

const optionalPositiveIntegerSchema = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.coerce.number().int().positive().optional(),
);

const passengerCountSchema = z.coerce.number().int().min(1).max(9).default(1);
const resultLimitSchema = z.coerce
  .number()
  .int()
  .min(1)
  .max(100)
  .default(20);

/** Accepts a JSON array or a comma-separated query parameter. */
const splitCommaSeparated = (value: unknown): unknown => {
  if (value === "" || value === null) return undefined;
  if (typeof value !== "string") return value;
  return value
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
};

const fareCategoryListSchema = z.preprocess(
  splitCommaSeparated,
  z.array(z.enum(FARE_CATEGORIES)).min(1).optional(),
);

const demandLevelListSchema = z.preprocess(
  splitCommaSeparated,
  z.array(z.enum(DEMAND_LEVELS)).min(1).optional(),
);

const anywhereSearchBaseShape = {
  departureDateFrom: isoDateSchema,
  departureDateTo: isoDateSchema,
  passengers: passengerCountSchema,
  maxPriceInCents: optionalNonNegativeIntegerSchema,
  maxTransfers: optionalNonNegativeIntegerSchema,
  maxDurationMinutes: optionalPositiveIntegerSchema,
  categories: fareCategoryListSchema,
  demandLevels: demandLevelListSchema,
  sortBy: z.enum(JOURNEY_SORTS).default("BEST"),
  limit: resultLimitSchema,
};

const fromAnywhereSearchSchema = z.object({
  ...anywhereSearchBaseShape,
  mode: z.literal("from"),
  originStationId: stationIdSchema,
  destinationStationId: z.never().optional(),
});

const toAnywhereSearchSchema = z.object({
  ...anywhereSearchBaseShape,
  mode: z.literal("to"),
  destinationStationId: stationIdSchema,
  originStationId: z.never().optional(),
});

export const anywhereSearchQuerySchema = z
  .discriminatedUnion("mode", [
    fromAnywhereSearchSchema,
    toAnywhereSearchSchema,
  ])
  .superRefine((query, ctx) => {
    if (query.departureDateTo < query.departureDateFrom) {
      ctx.addIssue({
        code: "custom",
        path: ["departureDateTo"],
        message: "departureDateTo must not be before departureDateFrom",
      });
    }
  }) satisfies z.ZodType<AnywhereSearchQuery>;

/** Free-text station lookup used by `GET /api/stations/search`. */
export const stationSearchQuerySchema = z.object({
  q: z
    .string()
    .trim()
    .min(2, "Search query must be at least 2 characters")
    .max(120, "Search query must be at most 120 characters"),
});

export const fareCalendarQuerySchema = z.object({
  originStationId: stationIdSchema,
  destinationStationId: stationIdSchema,
  month: isoMonthSchema,
  passengers: passengerCountSchema,
  maxPriceInCents: optionalNonNegativeIntegerSchema,
  maxTransfers: optionalNonNegativeIntegerSchema,
  categories: fareCategoryListSchema,
}) satisfies z.ZodType<FareCalendarQuery>;

export const fareDaySchema = z.object({
  date: isoDateSchema,
  priceInCents: z.number().int().nonnegative(),
  currency: z.literal("EUR"),
  category: z.enum(FARE_CATEGORIES),
  demandLevel: z.enum(DEMAND_LEVELS),
  available: z.boolean(),
}) satisfies z.ZodType<FareDay>;
