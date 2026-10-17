import type { AnywhereSearchQuery } from "@/types/rail";
import type {
  AnywhereSearchResponse,
  ApiProblem,
  StationSearchResponse,
} from "@/types/api";

export interface ApiClientOptions {
  /**
   * Absolute origin for server-side calls. Leave empty in the browser so
   * requests resolve against the current origin.
   */
  readonly baseUrl?: string;
  readonly signal?: AbortSignal;
}

/** Thrown for every non-2xx response; `problem` carries the RFC 7807 body. */
export class ApiClientError extends Error {
  readonly status: number;
  readonly problem: ApiProblem;

  constructor(status: number, problem: ApiProblem) {
    super(problem.detail);
    this.name = "ApiClientError";
    this.status = status;
    this.problem = problem;
  }
}

function isApiProblem(value: unknown): value is ApiProblem {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<ApiProblem>;
  return (
    candidate.success === false &&
    typeof candidate.type === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.status === "number" &&
    typeof candidate.detail === "string"
  );
}

async function apiFetch<T>(
  path: string,
  init: RequestInit,
  options: ApiClientOptions,
): Promise<T> {
  const baseUrl = (options.baseUrl ?? "").replace(/\/+$/, "");
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    signal: options.signal,
  });

  const contentType = response.headers.get("content-type") ?? "";
  const payload: unknown = contentType.includes("json")
    ? await response.json().catch(() => null)
    : null;

  if (!response.ok) {
    if (isApiProblem(payload)) {
      throw new ApiClientError(response.status, payload);
    }

    throw new ApiClientError(response.status, {
      success: false,
      type: "about:blank",
      title: response.statusText || "Request failed",
      status: response.status,
      detail: `Request to ${path} failed with status ${response.status}`,
    });
  }

  return payload as T;
}

/** Full response envelope, including the total number of offers. */
export function searchAnywhere(
  query: AnywhereSearchQuery,
  options: ApiClientOptions = {},
): Promise<AnywhereSearchResponse> {
  return apiFetch<AnywhereSearchResponse>(
    "/api/search/anywhere",
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify(query),
    },
    options,
  );
}

export function searchStations(
  query: string,
  options: ApiClientOptions = {},
): Promise<StationSearchResponse> {
  const search = new URLSearchParams({ q: query });

  return apiFetch<StationSearchResponse>(
    `/api/stations/search?${search.toString()}`,
    { method: "GET", headers: { accept: "application/json" } },
    options,
  );
}
