/**
 * Raised when a provider is selected but its upstream transport has not been
 * configured yet. The message is intentionally actionable because this error is
 * surfaced as a 503 by the API layer.
 */
export class UpstreamNotConfiguredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UpstreamNotConfiguredError";
  }
}
