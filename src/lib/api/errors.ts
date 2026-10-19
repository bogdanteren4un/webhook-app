import { z } from "zod"

const KNOWN_ERROR_TYPES = [
  "BadRequestException",
  "AuthenticationException",
  "NotFoundException",
  "TokenMismatchException",
  "ValidationException",
] as const

export type ApiErrorType = (typeof KNOWN_ERROR_TYPES)[number] | "UnknownException"

/** Field name → list of messages, as returned in `error.payload` of a 422. */
export type FieldErrors = Record<string, string[]>

const errorBodySchema = z.object({
  error: z.object({
    type: z.string(),
    message: z.string(),
    payload: z.record(z.string(), z.array(z.string())).optional(),
  }),
})

function toErrorType(value: string): ApiErrorType {
  return (KNOWN_ERROR_TYPES as readonly string[]).includes(value)
    ? (value as ApiErrorType)
    : "UnknownException"
}

/** A non-2xx response from the API, normalized from the contract's error format. */
export class ApiError extends Error {
  override readonly name = "ApiError"

  constructor(
    readonly status: number,
    readonly type: ApiErrorType,
    message: string,
    readonly fieldErrors: FieldErrors = {},
  ) {
    super(message)
  }

  static async fromResponse(response: Response): Promise<ApiError> {
    const body: unknown = await response.json().catch(() => null)
    const parsed = errorBodySchema.safeParse(body)

    if (!parsed.success) {
      return new ApiError(
        response.status,
        "UnknownException",
        `Request failed with status ${response.status}`,
      )
    }

    const { type, message, payload } = parsed.data.error
    return new ApiError(response.status, toErrorType(type), message, payload)
  }
}

/** The session could not be restored (rotate failed or the retry got 401 again). */
export class SessionExpiredError extends Error {
  override readonly name = "SessionExpiredError"

  constructor() {
    super("Your session has expired. Please sign in again.")
  }
}

export function isApiError(error: unknown, status?: number): error is ApiError {
  return error instanceof ApiError && (status === undefined || error.status === status)
}

export function isValidationError(error: unknown): error is ApiError {
  return isApiError(error, 422)
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError || error instanceof SessionExpiredError) return error.message
  return "Something went wrong. Check your connection and try again."
}
