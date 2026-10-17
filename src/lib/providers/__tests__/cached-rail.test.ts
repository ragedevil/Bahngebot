import { describe, expect, it, vi } from "vitest";

import type {
  AnywhereSearchQuery,
  FareDay,
  JourneyOffer,
  Station,
} from "@/types/rail";

import { CachedRailProvider } from "../cached-rail.provider";
import type { IRailDataProvider } from "../rail-provider.interface";

const FILTER: AnywhereSearchQuery = {
  mode: "from",
  originStationId: "8000261",
  departureDateFrom: "2026-10-20",
  departureDateTo: "2026-10-20",
  passengers: 1,
  sortBy: "BEST",
  limit: 20,
};

function createFakeProvider() {
  const searchAnywhere = vi.fn(
    async (): Promise<JourneyOffer[]> => [],
  );
  const getFareCalendar = vi.fn(
    async (): Promise<FareDay[]> => [],
  );
  const resolveStation = vi.fn(
    async (): Promise<Station[]> => [],
  );

  const provider: IRailDataProvider = {
    searchAnywhere,
    getFareCalendar,
    resolveStation,
  };

  return { provider, searchAnywhere, getFareCalendar, resolveStation };
}

describe("CachedRailProvider", () => {
  it("caches search and station lookups by query", async () => {
    const fake = createFakeProvider();
    const provider = new CachedRailProvider(fake.provider);

    await provider.searchAnywhere(FILTER);
    await provider.searchAnywhere(FILTER);
    await provider.resolveStation("Berlin");
    await provider.resolveStation("Berlin");

    expect(fake.searchAnywhere).toHaveBeenCalledTimes(1);
    expect(fake.resolveStation).toHaveBeenCalledTimes(1);
  });

  it("treats equivalent query objects as the same cache entry", async () => {
    const fake = createFakeProvider();
    const provider = new CachedRailProvider(fake.provider);
    const reordered = {
      limit: FILTER.limit,
      sortBy: FILTER.sortBy,
      passengers: FILTER.passengers,
      departureDateTo: FILTER.departureDateTo,
      departureDateFrom: FILTER.departureDateFrom,
      originStationId: FILTER.originStationId,
      mode: FILTER.mode,
    } satisfies AnywhereSearchQuery;

    await provider.searchAnywhere(FILTER);
    await provider.searchAnywhere(reordered);

    expect(fake.searchAnywhere).toHaveBeenCalledTimes(1);
  });

  it("expires entries after the configured TTL", async () => {
    const fake = createFakeProvider();
    let now = 0;
    const provider = new CachedRailProvider(fake.provider, {
      ttlMs: 1_000,
      now: () => now,
    });

    await provider.searchAnywhere(FILTER);
    now = 999;
    await provider.searchAnywhere(FILTER);
    now = 1_000;
    await provider.searchAnywhere(FILTER);

    expect(fake.searchAnywhere).toHaveBeenCalledTimes(2);
  });

  it("evicts the least recently used entry at the size bound", async () => {
    const fake = createFakeProvider();
    const provider = new CachedRailProvider(fake.provider, { maxEntries: 2 });

    await provider.resolveStation("a");
    await provider.resolveStation("b");
    await provider.resolveStation("a");
    await provider.resolveStation("c");
    await provider.resolveStation("a");
    await provider.resolveStation("b");

    expect(fake.resolveStation).toHaveBeenCalledTimes(4);
  });

  it("shares one upstream request between concurrent misses", async () => {
    let release: (offers: JourneyOffer[]) => void = () => {};
    const searchAnywhere = vi.fn(
      () =>
        new Promise<JourneyOffer[]>((resolve) => {
          release = resolve;
        }),
    );
    const provider = new CachedRailProvider({
      searchAnywhere,
      getFareCalendar: async () => [],
      resolveStation: async () => [],
    });

    const first = provider.searchAnywhere(FILTER);
    const second = provider.searchAnywhere(FILTER);
    release([]);

    await expect(Promise.all([first, second])).resolves.toEqual([[], []]);
    expect(searchAnywhere).toHaveBeenCalledTimes(1);
  });

  it("passes fare calendars through without caching", async () => {
    const fake = createFakeProvider();
    const provider = new CachedRailProvider(fake.provider);

    await provider.getFareCalendar("8000261", "8011160", "2026-10");
    await provider.getFareCalendar("8000261", "8011160", "2026-10");

    expect(fake.getFareCalendar).toHaveBeenCalledTimes(2);
  });
});
