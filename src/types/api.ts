import type { JourneyOffer, Station } from "./rail";

/** One invalid field reported by request validation. */
export interface ApiFieldIssue {
  /** Dot-separated path of the offending field; empty for body-level issues. */
  readonly path: string;
  readonly code: string;
  readonly message: string;
}

/**
 * RFC 7807 problem document. `success` is an extension member so clients can
 * discriminate success and failure payloads with a single boolean.
 */
export interface ApiProblem {
  readonly success: false;
  /** Problem type URI. `about:blank` means "no specific type". */
  readonly type: string;
  readonly title: string;
  readonly status: number;
  readonly detail: string;
  readonly instance?: string;
  readonly errors?: readonly ApiFieldIssue[];
}

export interface AnywhereSearchResponse {
  readonly success: true;
  readonly count: number;
  readonly data: JourneyOffer[];
}

export interface StationSearchResponse {
  readonly success: true;
  readonly data: Station[];
}
