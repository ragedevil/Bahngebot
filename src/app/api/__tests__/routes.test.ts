import { describe, expect, it } from "vitest";

import { POST } from "@/app/api/search/anywhere/route";
import { GET } from "@/app/api/stations/search/route";

describe("api routes", () => {
  it("returns offers", async () => {
    const response = await POST(
      new Request("http://localhost/api/search/anywhere", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          mode: "from",
          originStationId: "8000261",
          departureDateFrom: "2026-11-02",
          departureDateTo: "2026-11-02",
          limit: 3,
        }),
      }),
    );
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.count).toBe(3);
    expect(body.data).toHaveLength(3);
  });

  it("returns zod field issues", async () => {
    const response = await POST(
      new Request("http://localhost/api/search/anywhere", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ mode: "from", originStationId: "123" }),
      }),
    );
    const body = await response.json();
    expect(response.status).toBe(400);
    expect(response.headers.get("content-type")).toContain(
      "application/problem+json",
    );
    expect(body.success).toBe(false);
    expect(body.errors.length).toBeGreaterThan(0);
  });

  it("rejects malformed json", async () => {
    const response = await POST(
      new Request("http://localhost/api/search/anywhere", {
        method: "POST",
        body: "{",
      }),
    );
    expect(response.status).toBe(400);
  });

  it("searches stations and rejects short queries", async () => {
    const ok = await GET(
      new Request("http://localhost/api/stations/search?q=berlin"),
    );
    const okBody = await ok.json();
    expect(ok.status).toBe(200);
    expect(okBody.data[0].name).toContain("Berlin");

    const bad = await GET(
      new Request("http://localhost/api/stations/search?q=b"),
    );
    expect(bad.status).toBe(400);
  });

  it("resolves station queries with umlauts and transliterations", async () => {
    for (const query of ["München", "M%C3%BCnchen", "Muenchen"]) {
      const response = await GET(
        new Request(`http://localhost/api/stations/search?q=${query}`),
      );
      const body = await response.json();
      expect(response.status).toBe(200);
      expect(body.data[0]).toEqual(
        expect.objectContaining({ id: "8000261" }),
      );
    }
  });

  it("does not fail on malformed percent escapes", async () => {
    const response = await GET(
      new Request("http://localhost/api/stations/search?q=100%"),
    );
    expect(response.status).toBe(200);
  });

  it("maps unknown stations to 404", async () => {
    const response = await POST(
      new Request("http://localhost/api/search/anywhere", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          mode: "from",
          originStationId: "9999999",
          departureDateFrom: "2026-11-02",
          departureDateTo: "2026-11-02",
        }),
      }),
    );
    expect(response.status).toBe(404);
  });
});
