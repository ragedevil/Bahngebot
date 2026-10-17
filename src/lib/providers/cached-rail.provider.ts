import { createHash } from "node:crypto";

import type {
  AnywhereSearchQuery,
  FareDay,
  JourneyOffer,
  Station,
} from "@/types/rail";

import type { IRailDataProvider } from "./rail-provider.interface";

const DEFAULT_TTL_MS = 15 * 60 * 1_000;
const DEFAULT_MAX_ENTRIES = 500;

interface CacheEntry {
  readonly value: unknown;
  readonly expiresAt: number;
}

export interface CachedRailProviderOptions {
  /** Time a value stays fresh. Defaults to 15 minutes. */
  readonly ttlMs?: number;
  /** Maximum number of cached responses. Defaults to 500. */
  readonly maxEntries?: number;
  /** Injectable clock for deterministic tests. */
  readonly now?: () => number;
}

/**
 * Recursively sorts object keys and drops `undefined` values so equivalent
 * query objects always produce the same cache key.
 */
function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);

  if (value !== null && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return Object.fromEntries(
      Object.keys(record)
        .sort()
        .filter((key) => record[key] !== undefined)
        .map((key) => [key, canonicalize(record[key])]),
    );
  }

  return value;
}

function hashQuery(value: unknown): string {
  return createHash("sha256")
    .update(JSON.stringify(canonicalize(value)))
    .digest("hex");
}

/**
 * Read-through, in-memory TTL cache for provider lookups.
 *
 * Only successful responses are cached, and concurrent misses share one
 * upstream request. Entries are evicted in least-recently-used order once the
 * configured bound is reached.
 */
export class CachedRailProvider implements IRailDataProvider {
  private readonly cache = new Map<string, CacheEntry>();
  private readonly inFlight = new Map<string, Promise<unknown>>();
  private readonly ttlMs: number;
  private readonly maxEntries: number;
  private readonly now: () => number;

  constructor(
    private readonly provider: IRailDataProvider,
    options: CachedRailProviderOptions = {},
  ) {
    this.ttlMs = Math.max(0, options.ttlMs ?? DEFAULT_TTL_MS);
    this.maxEntries = Math.max(
      0,
      Math.floor(options.maxEntries ?? DEFAULT_MAX_ENTRIES),
    );
    // Resolve Date.now lazily so fake timers are respected in tests.
    this.now = options.now ?? (() => Date.now());
  }

  searchAnywhere(filter: AnywhereSearchQuery): Promise<JourneyOffer[]> {
    return this.remember(`searchAnywhere:${hashQuery(filter)}`, () =>
      this.provider.searchAnywhere(filter),
    );
  }

  resolveStation(query: string): Promise<Station[]> {
    return this.remember(`resolveStation:${hashQuery(query.trim())}`, () =>
      this.provider.resolveStation(query),
    );
  }

  getFareCalendar(
    originId: string,
    destId: string,
    month: string,
  ): Promise<FareDay[]> {
    return this.provider.getFareCalendar(originId, destId, month);
  }

  /** Drops all cached and in-flight entries. Intended for tests/reloads. */
  clear(): void {
    this.cache.clear();
    this.inFlight.clear();
  }

  private async remember<T>(
    key: string,
    load: () => Promise<T>,
  ): Promise<T> {
    const cached = this.getFresh(key);
    if (cached !== undefined) return cached.value as T;

    const pending = this.inFlight.get(key);
    if (pending !== undefined) return pending as Promise<T>;

    const request = load()
      .then((value) => {
        this.store(key, value);
        return value;
      })
      .finally(() => {
        this.inFlight.delete(key);
      });

    this.inFlight.set(key, request);
    return request;
  }

  private getFresh(key: string): CacheEntry | undefined {
    const entry = this.cache.get(key);
    if (entry === undefined) return undefined;

    if (entry.expiresAt <= this.now()) {
      this.cache.delete(key);
      return undefined;
    }

    // Refresh insertion order so this entry is now the most recently used.
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry;
  }

  private store(key: string, value: unknown): void {
    if (this.ttlMs <= 0 || this.maxEntries <= 0) return;

    this.cache.delete(key);
    this.cache.set(key, {
      value,
      expiresAt: this.now() + this.ttlMs,
    });

    while (this.cache.size > this.maxEntries) {
      const oldest = this.cache.keys().next();
      if (oldest.done) break;
      this.cache.delete(oldest.value);
    }
  }
}
