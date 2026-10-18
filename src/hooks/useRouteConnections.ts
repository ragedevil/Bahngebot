"use client";

import { useEffect, useMemo, useState } from "react";
import type { TrainConnection } from "@/types/connection";
import {
  fallbackConnections,
  fetchConnections,
  type ConnectionResults,
} from "@/lib/connections";

interface RouteKey {
  from: string;
  to: string;
  date: string;
}

const SEED = fallbackConnections();

/**
 * Connections for a route, fetched from `/api/connections` and tagged with the
 * route that produced them.
 *
 * Two guarantees for the results feed:
 *  - the bundled connections are shown immediately, so the list is never blank
 *    while the request is in flight (or if it fails);
 *  - a stale response can never overwrite a newer route, because each payload
 *    carries its own key and is only used when it matches.
 *
 * `refetch` re-runs the request for a route already on screen.
 */
export function useRouteConnections(
  route: RouteKey,
  refetchToken = 0,
): { connections: TrainConnection[]; isLoading: boolean } {
  const { from, to, date } = route;
  const [result, setResult] = useState<
    (ConnectionResults & { key: string }) | null
  >(null);

  const key = `${from}|${to}|${date}|${refetchToken}`;

  useEffect(() => {
    const controller = new AbortController();

    void (async () => {
      const payload = await fetchConnections({ from, to, date }, controller.signal);
      if (controller.signal.aborted) return;
      setResult({ ...payload, key });
    })();

    return () => controller.abort();
  }, [from, to, date, key]);

  return useMemo(() => {
    // The fallback is already seeded, so `isLoading` marks background
    // refreshes; it is never used to hide the list.
    if (!result || result.key !== key) {
      return { connections: SEED, isLoading: true };
    }
    return {
      connections:
        result.connections.length > 0 ? result.connections : SEED,
      isLoading: false,
    };
  }, [result, key]);
}
