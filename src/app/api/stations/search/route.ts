import { type NextRequest } from "next/server";

import { toErrorResponse } from "@/lib/api/errors";
import { getRailDataProvider } from "@/lib/providers";
import { stationSearchQuerySchema } from "@/lib/validations/search";
import type { StationSearchResponse } from "@/types/api";

const SEARCH_PARAM = "q";
const REPLACEMENT_CHARACTER = "\uFFFD";

/**
 * URL parsing and percent-decoding can throw on raw, non-ASCII input such as
 * `?q=München` depending on the runtime. Treat those cases as "needs fallback"
 * instead of letting them escape as an unhandled 400/500.
 */
function hasMalformedEncoding(value: string): boolean {
  return (
    value.includes(REPLACEMENT_CHARACTER) || /%(?![0-9a-fA-F]{2})/.test(value)
  );
}

/** Decode a query component, falling back to the original value on bad escapes. */
function decodeQueryComponent(value: string, plusAsSpace: boolean): string {
  const candidate = plusAsSpace ? value.replace(/\+/g, " ") : value;

  try {
    return decodeURIComponent(candidate);
  } catch {
    return candidate;
  }
}

/**
 * Extract `q` from the raw request URL without relying on `URL` parsing, which
 * is the last-resort path when both `nextUrl` and `new URL` fail.
 */
function readRawQueryParam(url: string, key: string): string | undefined {
  const queryStart = url.indexOf("?");
  if (queryStart === -1) return undefined;

  const hashStart = url.indexOf("#", queryStart);
  const query = url.slice(
    queryStart + 1,
    hashStart === -1 ? undefined : hashStart,
  );

  for (const part of query.split("&")) {
    if (part.length === 0) continue;

    const separator = part.indexOf("=");
    const rawKey = separator === -1 ? part : part.slice(0, separator);
    if (decodeQueryComponent(rawKey, false) !== key) continue;

    return separator === -1 ? "" : part.slice(separator + 1);
  }

  return undefined;
}

function extractSearchQuery(request: Request): string {
  // Preferred path: Next.js has already parsed the URL into `nextUrl`.
  try {
    const nextUrl = (request as NextRequest).nextUrl;
    const value = nextUrl?.searchParams.get(SEARCH_PARAM);

    if (typeof value === "string" && !hasMalformedEncoding(value)) {
      return decodeQueryComponent(value, false);
    }
  } catch {
    // Fall through to standard URL parsing below.
  }

  // Standard URL handling still works for relative/native requests, and
  // percent-encodes raw non-ASCII input when the runtime supports it.
  try {
    const value = new URL(request.url).searchParams.get(SEARCH_PARAM);

    if (value !== null && !hasMalformedEncoding(value)) {
      return decodeQueryComponent(value, false);
    }
  } catch {
    // Fall through to raw query extraction below.
  }

  const rawValue = readRawQueryParam(request.url, SEARCH_PARAM);
  return rawValue === undefined ? "" : decodeQueryComponent(rawValue, true);
}

function extractPathname(request: Request): string {
  try {
    const nextUrl = (request as NextRequest).nextUrl;
    if (nextUrl?.pathname) return nextUrl.pathname;
  } catch {
    // Fall through.
  }

  try {
    return new URL(request.url).pathname;
  } catch {
    const path = request.url.split("?")[0].split("#")[0];
    return path.startsWith("/") ? path : "/";
  }
}

/** `GET /api/stations/search?q=…` — resolve a free-text station query. */
export async function GET(request: Request): Promise<Response> {
  const instance = extractPathname(request);
  const q = extractSearchQuery(request);

  try {
    const query = stationSearchQuerySchema.parse({ q });
    const data = await getRailDataProvider().resolveStation(query.q);

    return Response.json({
      success: true,
      data,
    } satisfies StationSearchResponse);
  } catch (error) {
    return toErrorResponse(error, { instance });
  }
}
