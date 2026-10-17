import { ZodError } from "zod";

import type { ApiFieldIssue, ApiProblem } from "@/types/api";

const STATUS_TITLES: Readonly<Record<number, string>> = {
  400: "Bad Request",
  404: "Not Found",
  500: "Internal Server Error",
  503: "Service Unavailable",
};

/** Error with an intentional HTTP status, safe to expose to clients. */
export class ApiError extends Error {
  readonly status: number;
  readonly title: string;
  readonly errors?: readonly ApiFieldIssue[];

  constructor(
    status: number,
    detail: string,
    options: { title?: string; errors?: readonly ApiFieldIssue[] } = {},
  ) {
    super(detail);
    this.name = "ApiError";
    this.status = status;
    this.title = options.title ?? STATUS_TITLES[status] ?? "Error";
    this.errors = options.errors;
  }
}

export function problemResponse(
  status: number,
  detail: string,
  options: {
    title?: string;
    errors?: readonly ApiFieldIssue[];
    instance?: string;
  } = {},
): Response {
  const problem: ApiProblem = {
    success: false,
    type: "about:blank",
    title: options.title ?? STATUS_TITLES[status] ?? "Error",
    status,
    detail,
    ...(options.instance ? { instance: options.instance } : {}),
    ...(options.errors && options.errors.length > 0
      ? { errors: options.errors }
      : {}),
  };

  return Response.json(problem, {
    status,
    headers: { "content-type": "application/problem+json; charset=utf-8" },
  });
}

function zodFieldIssues(error: ZodError): ApiFieldIssue[] {
  return error.issues.map((issue) => ({
    path: issue.path.map(String).join("."),
    code: issue.code,
    message: issue.message,
  }));
}

/**
 * Converts any thrown value into a problem response:
 * Zod failures become 400s with field issues, known provider errors keep their
 * semantics, everything else is logged and reported as an opaque 500.
 */
export function toErrorResponse(
  error: unknown,
  options: { instance?: string } = {},
): Response {
  if (error instanceof ZodError) {
    return problemResponse(400, "Request validation failed", {
      errors: zodFieldIssues(error),
      instance: options.instance,
    });
  }

  if (error instanceof ApiError) {
    return problemResponse(error.status, error.message, {
      title: error.title,
      errors: error.errors,
      instance: options.instance,
    });
  }

  // Providers may signal a missing station with their own error class; match
  // by name so the API layer stays provider-agnostic.
  if (error instanceof Error && error.name === "UnknownStationError") {
    return problemResponse(404, error.message, { instance: options.instance });
  }

  if (error instanceof Error && error.name === "UpstreamNotConfiguredError") {
    return problemResponse(503, error.message, { instance: options.instance });
  }

  console.error("[api] Unhandled error", error);
  return problemResponse(500, "An unexpected error occurred", {
    instance: options.instance,
  });
}
