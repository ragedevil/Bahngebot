import type {
  FareDay,
  JourneyOffer,
  Station,
} from "@/types/rail";

import { UpstreamNotConfiguredError } from "../errors";
import type { IRailDataProvider } from "../rail-provider.interface";

const NOT_CONFIGURED_MESSAGE =
  'The live rail provider is selected but has no upstream adapter configured. ' +
  'Configure the live upstream credentials, or set RAIL_DATA_PROVIDER="mock" ' +
  "for local development.";

/**
 * Placeholder for a future live integration. Failing loudly is safer than
 * silently falling back to mock data in production.
 */
export class LiveRailProvider implements IRailDataProvider {
  async searchAnywhere(): Promise<JourneyOffer[]> {
    throw this.notConfigured("searchAnywhere");
  }

  async getFareCalendar(): Promise<FareDay[]> {
    throw this.notConfigured("getFareCalendar");
  }

  async resolveStation(): Promise<Station[]> {
    throw this.notConfigured("resolveStation");
  }

  private notConfigured(operation: string): UpstreamNotConfiguredError {
    return new UpstreamNotConfiguredError(
      `${operation} failed: ${NOT_CONFIGURED_MESSAGE}`,
    );
  }
}
