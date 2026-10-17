import { describe, expect, it } from "vitest";

import { fareDaySchema, journeyOfferSchema } from "@/lib/validations/search";
import type {
  AnywhereSearchQuery,
  FareCategory,
  FromAnywhereSearchQuery,
  JourneyOffer,
} from "@/types/rail";

import {
  MockRailProvider,
  UnknownStationError,
} from "../mock-rail.provider";

const MUNICH = "8000261";
const BERLIN = "8011160";
const FRANKFURT = "8000105";
const SALZBURG = "8100002";
const TUESDAY = "2026-10-20";
const FRIDAY = "2026-10-23";

const provider = new MockRailProvider();

type FromOverrides = Partial<
  Omit<FromAnywhereSearchQuery, "mode" | "originStationId">
>;

function fromQuery(
  overrides: FromOverrides = {},
): FromAnywhereSearchQuery {
  return {
    mode: "from",
    originStationId: MUNICH,
    departureDateFrom: TUESDAY,
    departureDateTo: TUESDAY,
    passengers: 1,
    sortBy: "BEST",
    limit: 100,
    ...overrides,
  };
}

const LOCAL_HOUR_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/Berlin",
  hour: "2-digit",
  hourCycle: "h23",
});

function localHour(iso: string): number {
  return Number(LOCAL_HOUR_FORMATTER.format(new Date(iso)));
}

function offerAt(
  offers: readonly JourneyOffer[],
  destinationId: string,
  hour: number,
): JourneyOffer {
  const offer = offers.find(
    (candidate) =>
      candidate.destination.id === destinationId &&
      localHour(candidate.departure) === hour,
  );
  if (!offer) {
    throw new Error(
      `No offer to ${destinationId} departing at ${hour}:00 found`,
    );
  }
  return offer;
}

async function offersForCategory(
  category: FareCategory,
): Promise<JourneyOffer[]> {
  return provider.searchAnywhere(fromQuery({ categories: [category] }));
}

describe("MockRailProvider.resolveStation", () => {
  it("resolves by official name, id, city, and German transliteration", async () => {
    await expect(provider.resolveStation("München Hbf")).resolves.toEqual([
      expect.objectContaining({ id: MUNICH, name: "München Hbf" }),
    ]);
    await expect(provider.resolveStation("8000261")).resolves.toEqual([
      expect.objectContaining({ id: MUNICH }),
    ]);
    await expect(provider.resolveStation("muenchen")).resolves.toEqual([
      expect.objectContaining({ id: MUNICH }),
    ]);
    await expect(provider.resolveStation("Wien")).resolves.toEqual([
      expect.objectContaining({ id: "8103000" }),
    ]);
    await expect(provider.resolveStation("zuerich")).resolves.toEqual([
      expect.objectContaining({ id: "8503000" }),
    ]);
  });

  it("returns no matches for an unknown station", async () => {
    await expect(provider.resolveStation("Atlantis")).resolves.toEqual([]);
  });
});

describe("MockRailProvider.searchAnywhere", () => {
  it("uses real corridor travel times", async () => {
    const offers = await provider.searchAnywhere(
      fromQuery({ categories: ["SUPER_SPARPREIS"] }),
    );

    expect(offerAt(offers, BERLIN, 6).durationMinutes).toBe(240); // ~4h
    expect(offerAt(offers, FRANKFURT, 6).durationMinutes).toBe(195); // 3h15
    expect(offerAt(offers, SALZBURG, 6).durationMinutes).toBe(100); // 1h40
    expect(offerAt(offers, BERLIN, 6).transfers).toBe(0);
  });

  it("calculates arrival timestamps from departure and duration", async () => {
    const offers = await provider.searchAnywhere(
      fromQuery({ categories: ["SUPER_SPARPREIS"] }),
    );

    for (const offer of offers) {
      expect(Number.isNaN(Date.parse(offer.departure))).toBe(false);
      expect(Number.isNaN(Date.parse(offer.arrival))).toBe(false);
      expect(Date.parse(offer.arrival) - Date.parse(offer.departure)).toBe(
        offer.durationMinutes * 60_000,
      );
    }
  });

  it("keeps every offer compliant with the domain schema", async () => {
    const offers = await provider.searchAnywhere(
      fromQuery({ categories: ["SUPER_SPARPREIS"] }),
    );

    for (const offer of offers) {
      expect(() => journeyOfferSchema.parse(offer)).not.toThrow();
    }
  });

  it("is fully deterministic", async () => {
    const first = await provider.searchAnywhere(fromQuery());
    const second = await provider.searchAnywhere(fromQuery());
    expect(second).toEqual(first);
  });

  it("honours the from/to endpoint invariant", async () => {
    const fromOffers = await provider.searchAnywhere(fromQuery());
    expect(fromOffers.every((offer) => offer.origin.id === MUNICH)).toBe(true);
    expect(fromOffers.every((offer) => offer.destination.id !== MUNICH)).toBe(
      true,
    );

    const toQuery: AnywhereSearchQuery = {
      ...fromQuery(),
      mode: "to",
      destinationStationId: BERLIN,
      originStationId: undefined,
    };
    const toOffers = await provider.searchAnywhere(toQuery);
    expect(toOffers.every((offer) => offer.destination.id === BERLIN)).toBe(
      true,
    );
    expect(toOffers.every((offer) => offer.origin.id !== BERLIN)).toBe(true);
  });

  it("applies early-weekday and Friday-afternoon demand profiles", async () => {
    const tuesday = await provider.searchAnywhere(
      fromQuery({ departureDateFrom: TUESDAY, departureDateTo: TUESDAY }),
    );
    const friday = await provider.searchAnywhere(
      fromQuery({ departureDateFrom: FRIDAY, departureDateTo: FRIDAY }),
    );

    const tuesdayBerlin = offerAt(tuesday, BERLIN, 6);
    const fridayBerlin = offerAt(friday, BERLIN, 15);

    expect(tuesdayBerlin.demandLevel).toBe("LOW");
    expect(tuesdayBerlin.category).toBe("SUPER_SPARPREIS");
    expect(tuesdayBerlin.priceInCents).toBeGreaterThanOrEqual(1_000);
    expect(tuesdayBerlin.priceInCents).toBeLessThanOrEqual(3_000);

    expect(fridayBerlin.demandLevel).toBe("HIGH");
    expect(fridayBerlin.category).toBe("FLEXPREIS");
    expect(fridayBerlin.priceInCents).toBeGreaterThan(20_000);
    expect(fridayBerlin.priceInCents).toBeGreaterThan(
      tuesdayBerlin.priceInCents,
    );
  });

  it("prices fare categories in ascending DB-like tiers", async () => {
    const [superSaver, saver, flex] = await Promise.all([
      offersForCategory("SUPER_SPARPREIS"),
      offersForCategory("SPARPREIS"),
      offersForCategory("FLEXPREIS"),
    ]);

    const superOffer = offerAt(superSaver, BERLIN, 6);
    const saverOffer = offerAt(saver, BERLIN, 6);
    const flexOffer = offerAt(flex, BERLIN, 6);

    expect(superOffer.priceInCents).toBeLessThan(saverOffer.priceInCents);
    expect(saverOffer.priceInCents).toBeLessThan(flexOffer.priceInCents);

    expect(superOffer.priceInCents).toBeGreaterThanOrEqual(999);
    expect(superOffer.priceInCents).toBeLessThanOrEqual(3_000);
    expect(saverOffer.priceInCents).toBeGreaterThanOrEqual(3_000);
    expect(saverOffer.priceInCents).toBeLessThanOrEqual(7_000);
    expect(flexOffer.priceInCents).toBeGreaterThanOrEqual(8_000);
    expect(flexOffer.priceInCents).toBeLessThanOrEqual(20_000);
  });

  it("applies budget, duration, and transfer filters", async () => {
    const budget = await provider.searchAnywhere(
      fromQuery({
        maxPriceInCents: 5_000,
        categories: ["SUPER_SPARPREIS", "SPARPREIS"],
      }),
    );
    expect(budget.length).toBeGreaterThan(0);
    expect(budget.every((offer) => offer.priceInCents <= 5_000)).toBe(true);

    const short = await provider.searchAnywhere(
      fromQuery({ maxDurationMinutes: 120 }),
    );
    expect(short.length).toBeGreaterThan(0);
    expect(
      short.every((offer) => offer.durationMinutes <= 120),
    ).toBe(true);
    expect(short.some((offer) => offer.destination.id === SALZBURG)).toBe(true);

    const direct = await provider.searchAnywhere(
      fromQuery({ maxTransfers: 0 }),
    );
    expect(direct.length).toBeGreaterThan(0);
    expect(direct.every((offer) => offer.transfers === 0)).toBe(true);
  });

  it("generates pre-filled bahn.de booking deep links", async () => {
    const offers = await provider.searchAnywhere(
      fromQuery({ categories: ["SUPER_SPARPREIS"] }),
    );
    const offer = offerAt(offers, BERLIN, 6);
    const url = new URL(offer.bookingDeepLink);
    const params = new URLSearchParams(url.hash.slice(1));

    expect(`${url.origin}${url.pathname}`).toBe(
      "https://www.bahn.de/buchung/fahrplan/suche",
    );
    expect(params.get("so")).toBe("München Hbf");
    expect(params.get("zo")).toBe("Berlin Hbf");
    expect(params.get("hd")).toBe("2026-10-20T06:00:00");
  });
});

describe("MockRailProvider.getFareCalendar", () => {
  it("returns one cheapest fare per day for the month", async () => {
    const calendar = await provider.getFareCalendar(
      MUNICH,
      BERLIN,
      "2026-10",
    );

    expect(calendar).toHaveLength(31);
    expect(calendar[0]).toMatchObject({
      date: "2026-10-01",
      currency: "EUR",
      available: true,
    });
    expect(calendar[30].date).toBe("2026-10-31");
    expect(new Set(calendar.map((day) => day.date)).size).toBe(31);
    expect(calendar.every((day) => day.priceInCents > 0)).toBe(true);

    for (const day of calendar) {
      expect(() => fareDaySchema.parse(day)).not.toThrow();
    }
  });

  it("is deterministic and rejects unknown stations", async () => {
    const first = await provider.getFareCalendar(MUNICH, BERLIN, "2026-10");
    const second = await provider.getFareCalendar(MUNICH, BERLIN, "2026-10");
    expect(second).toEqual(first);

    await expect(
      provider.getFareCalendar(MUNICH, "9999999", "2026-10"),
    ).rejects.toBeInstanceOf(UnknownStationError);
  });
});
