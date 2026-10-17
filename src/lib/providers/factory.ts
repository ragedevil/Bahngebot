import { CachedRailProvider } from "./cached-rail.provider";
import { LiveRailProvider } from "./live/live-rail.provider";
import { MockRailProvider } from "./mock/mock-rail.provider";
import type { IRailDataProvider } from "./rail-provider.interface";

export { CachedRailProvider } from "./cached-rail.provider";
export { UpstreamNotConfiguredError } from "./errors";
export { LiveRailProvider } from "./live/live-rail.provider";

export type RailDataProviderName = "mock" | "live";

interface RailProviderGlobal {
  railDataProvider?: IRailDataProvider;
  railDataProviderName?: RailDataProviderName;
}

// Reuse the provider and its cache across dev-server module reloads while
// keeping them per-process in production.
const providerGlobal = globalThis as typeof globalThis & RailProviderGlobal;

function resolveProviderName(): RailDataProviderName {
  const configured = process.env.RAIL_DATA_PROVIDER?.trim().toLowerCase();

  if (configured === undefined || configured === "") return "mock";
  if (configured === "mock" || configured === "live") return configured;

  throw new Error(
    `Invalid RAIL_DATA_PROVIDER "${configured}": expected "mock" or "live".`,
  );
}

function createProvider(name: RailDataProviderName): IRailDataProvider {
  switch (name) {
    case "mock":
      return new MockRailProvider();
    case "live":
      return new LiveRailProvider();
  }
}

/**
 * Process-wide provider used by API routes.
 *
 * The selected transport is wrapped in the shared TTL cache so every consumer
 * sees the same cached instance.
 */
export function getRailDataProvider(): IRailDataProvider {
  const name = resolveProviderName();

  if (
    providerGlobal.railDataProvider !== undefined &&
    providerGlobal.railDataProviderName === name
  ) {
    return providerGlobal.railDataProvider;
  }

  const provider = new CachedRailProvider(createProvider(name));
  providerGlobal.railDataProvider = provider;
  providerGlobal.railDataProviderName = name;
  return provider;
}

/** Clears the singleton. Intended for tests and explicit config reloads. */
export function resetRailDataProvider(): void {
  providerGlobal.railDataProvider = undefined;
  providerGlobal.railDataProviderName = undefined;
}
