import { NextResponse } from "next/server";
import { MOCK_CONNECTIONS } from "@/data/mockConnections";

/**
 * GET /api/connections?from=&to=&date=
 *
 * No upstream fares provider is integrated yet, so this serves the bundled
 * mock set explicitly tagged `source: "mock"`. The client treats a non-2xx,
 * an empty list or a malformed payload the same way, so swapping in a real
 * provider only changes the body — never the UI contract.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from")?.trim() || "Berlin Hbf";
  const to = searchParams.get("to")?.trim() || "München Hbf";
  const date = searchParams.get("date")?.trim() || "2026-10-24";

  const connections = MOCK_CONNECTIONS.map((connection) => ({
    ...connection,
    departureStation: from,
    arrivalStation: to,
    date,
    legs: connection.legs.map((leg, index, legs) => ({
      ...leg,
      departureStation:
        index === 0
          ? leg.departureStation || from
          : leg.departureStation,
      arrivalStation:
        index === legs.length - 1
          ? leg.arrivalStation || to
          : leg.arrivalStation,
    })),
  }));

  return NextResponse.json({ source: "mock", connections });
}
