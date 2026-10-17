import { afterEach, beforeEach, describe, expect, it } from "vitest";

import type { AnywhereSearchQuery } from "@/types/rail";

import {
  getRailDataProvider,
  resetRailDataProvider,
  UpstreamNotConfiguredError,
} from "../factory";

const FILTER: AnywhereSearchQuery = {
  mode: "from",
  originStationId: "8000261",
  departureDateFrom: "2026-10-20",
  departureDateTo: "2026-10-20",
  passengers: 1,
  sortBy: "BEST",
  limit: 5,
};

const originalProvider = process.env.RAIL_DATA_PROVIDER;

describe("getRailDataProvider", () => {
  beforeEach(() => {
    resetRailDataProvider();
    delete process.env.RAIL_DATA_PROVIDER;
  });

  afterEach(() => {
    resetRailDataProvider();
    if (originalProvider === undefined) {
      delete process.env.RAIL_DATA_PROVIDER;
    } else {
      process.env.RAIL_DATA_PROVIDER = originalProvider;
    }
  });

  it("defaults to a cached mock provider singleton", async () => {
    const provider = getRailDataProvider();

    expect(provider).toBe(getRailDataProvider());
    await expect(provider.resolveStation("Berlin")).resolves.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: "8011160" })]),
    );
  });

  it("returns a live provider stub that reports missing configuration", async () => {
    process.env.RAIL_DATA_PROVIDER = "live";
    const provider = getRailDataProvider();

    await expect(provider.searchAnywhere(FILTER)).rejects.toBeInstanceOf(
      UpstreamNotConfiguredError,
    );
  });

  it("rejects unknown provider names", () => {
    process.env.RAIL_DATA_PROVIDER = "carrier-pigeon";

    expect(() => getRailDataProvider()).toThrow(
      /Invalid RAIL_DATA_PROVIDER "carrier-pigeon"/,
    );
  });
});
