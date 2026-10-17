import { ApiError, toErrorResponse } from "@/lib/api/errors";
import { getRailDataProvider } from "@/lib/providers";
import { anywhereSearchQuerySchema } from "@/lib/validations/search";
import type { AnywhereSearchResponse } from "@/types/api";

/** `POST /api/search/anywhere` — discovery search with one fixed endpoint. */
export async function POST(request: Request): Promise<Response> {
  const instance = new URL(request.url).pathname;

  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw new ApiError(400, "Request body must be valid JSON");
    }

    const query = anywhereSearchQuerySchema.parse(body);
    const data = await getRailDataProvider().searchAnywhere(query);

    return Response.json({
      success: true,
      count: data.length,
      data,
    } satisfies AnywhereSearchResponse);
  } catch (error) {
    return toErrorResponse(error, { instance });
  }
}
