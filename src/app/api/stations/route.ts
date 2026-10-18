import type { NextRequest } from "next/server";
import { STATIONS } from "@/data/stations";

const MAX_RESULTS = 8;

/** Strip diacritics so "munchen" finds "München". */
function fold(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

/**
 * Station lookup used by the search dock's autocomplete.
 *
 * `GET /api/stations?q=Dort` → `{ stations: [{ name, city }, …] }`, ranked by
 * prefix match first, then substring match on either the station or its city.
 */
export function GET(request: NextRequest) {
  const query = fold(request.nextUrl.searchParams.get("q")?.trim() ?? "");

  if (!query) {
    return Response.json({ stations: [] });
  }

  const ranked = STATIONS.map((station) => {
    const name = fold(station.name);
    const city = fold(station.city);
    const rank = name.startsWith(query)
      ? 0
      : city.startsWith(query)
        ? 1
        : name.includes(query) || city.includes(query)
          ? 2
          : -1;
    return { station, rank };
  })
    .filter((entry) => entry.rank >= 0)
    .sort(
      (a, b) =>
        a.rank - b.rank || a.station.name.localeCompare(b.station.name, "de"),
    )
    .slice(0, MAX_RESULTS)
    .map((entry) => entry.station);

  return Response.json({ stations: ranked });
}
