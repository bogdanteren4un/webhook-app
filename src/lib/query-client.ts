import { QueryClient } from "@tanstack/react-query"

import { ApiError, SessionExpiredError } from "@/lib/api/errors"

/**
 * API errors are final: the HTTP client already retried what is retryable
 * (419 and 401). Only unexpected failures, like a network error, get one more try.
 */
function shouldRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiError || error instanceof SessionExpiredError) return false
  return failureCount < 1
}

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: shouldRetry,
      },
    },
  })
}
