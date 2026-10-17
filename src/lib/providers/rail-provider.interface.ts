import type {
  AnywhereSearchQuery,
  FareDay,
  JourneyOffer,
  Station,
} from "@/types/rail";

/**
 * Provider-agnostic rail data contract.
 *
 * Implementations may be backed by the deterministic mock engine, DB APIs, or
 * future partners. Callers only ever see normalized domain models.
 */
export interface IRailDataProvider {
  /**
   * Discover journeys where one endpoint is fixed and the other is "anywhere".
   * Implementations must apply all filters (price, transfers, duration,
   * category, demand) before returning at most `filter.limit` offers.
   */
  searchAnywhere(filter: AnywhereSearchQuery): Promise<JourneyOffer[]>;

  /** Cheapest available fare per day for a route and calendar month. */
  getFareCalendar(
    originId: string,
    destId: string,
    month: string,
  ): Promise<FareDay[]>;

  /** Resolve a free-text station query (name, city, slug, or EVA/IBNR id). */
  resolveStation(query: string): Promise<Station[]>;
}
