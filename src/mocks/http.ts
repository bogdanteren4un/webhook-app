import { HttpResponse } from "msw"

import type { ApiErrorType, FieldErrors } from "@/lib/api/errors"
import { API_BASE_PATH } from "@/lib/config"

import { CSRF_TOKEN, getActiveSession } from "./db"

/** Origin-agnostic pattern, so the same handlers match in the browser worker and in Node. */
export function apiPath(path: string): string {
  return `*${API_BASE_PATH}${path}`
}

function errorResponse(
  status: number,
  type: Exclude<ApiErrorType, "UnknownException">,
  message: string,
  payload?: FieldErrors,
) {
  return HttpResponse.json({ error: { type, message, ...(payload && { payload }) } }, { status })
}

export const errors = {
  badRequest: (message: string) => errorResponse(400, "BadRequestException", message),
  unauthenticated: () => errorResponse(401, "AuthenticationException", "Unauthenticated."),
  notFound: () => errorResponse(404, "NotFoundException", "The requested resource was not found."),
  tokenMismatch: () => errorResponse(419, "TokenMismatchException", "CSRF token mismatch."),
  validation: (payload: FieldErrors) =>
    errorResponse(422, "ValidationException", "The given data was invalid.", payload),
}

const CSRF_PROTECTED_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"])

/**
 * Checks shared by every endpoint, in the order a backend runs them: AJAX header, CSRF
 * (before any state change), then the session. Returns the error response or `null`.
 */
export function rejectRequest(request: Request, { auth }: { auth: boolean }) {
  if (request.headers.get("X-Requested-With") !== "XMLHttpRequest") {
    return errors.badRequest("The X-Requested-With header is required.")
  }
  if (
    CSRF_PROTECTED_METHODS.has(request.method) &&
    request.headers.get("X-CSRF-TOKEN") !== CSRF_TOKEN
  ) {
    return errors.tokenMismatch()
  }
  if (auth && !getActiveSession()) {
    return errors.unauthenticated()
  }
  return null
}

export async function readJsonBody(request: Request): Promise<Record<string, unknown>> {
  const body: unknown = await request.json().catch(() => null)
  return typeof body === "object" && body !== null && !Array.isArray(body)
    ? (body as Record<string, unknown>)
    : {}
}

export function stringField(body: Record<string, unknown>, key: string): string {
  const value = body[key]
  return typeof value === "string" ? value : ""
}
