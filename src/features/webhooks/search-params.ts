import { useCallback, useEffect, useMemo } from "react"
import { useSearchParams } from "react-router"

import { routes } from "@/lib/routes"

import type { WebhookListParams } from "./schemas"

const DEFAULT_PARAMS: WebhookListParams = { page: 1, search: "" }

/** A positive integer, or null for anything else (`abc`, `0`, `-1`, `2.5`, empty). */
export function parsePage(value: string | null): number | null {
  if (value === null) return null
  const page = Number(value)
  return Number.isInteger(page) && page >= 1 ? page : null
}

/** List state lives in the URL; missing or invalid values fall back to the defaults. */
export function readListParams(searchParams: URLSearchParams): WebhookListParams {
  return {
    page: parsePage(searchParams.get("page")) ?? DEFAULT_PARAMS.page,
    search: searchParams.get("search") ?? DEFAULT_PARAMS.search,
  }
}

/** Default values (page 1, empty search) are left out, so every view has one URL. */
export function toListQuery(params: Partial<WebhookListParams>): URLSearchParams {
  const query = new URLSearchParams()
  if (params.page !== undefined && params.page !== DEFAULT_PARAMS.page) {
    query.set("page", String(params.page))
  }
  if (params.search) query.set("search", params.search)
  return query
}

function withQuery(path: string, params: Partial<WebhookListParams>): string {
  const query = toListQuery(params).toString()
  return query ? `${path}?${query}` : path
}

export function webhookListHref(params: Partial<WebhookListParams>): string {
  return withQuery(routes.webhooks, params)
}

/** The edit page keeps the list params, so "back to list" restores the same view. */
export function webhookEditHref(id: number, params: Partial<WebhookListParams>): string {
  return withQuery(routes.webhook(id), params)
}

export function useWebhookListParams() {
  const [searchParams, setSearchParams] = useSearchParams()
  const params = useMemo(() => readListParams(searchParams), [searchParams])

  /**
   * Merges `update` into the current params and writes them in one navigation.
   * Every committed change is a history entry, so back/forward walks through them.
   */
  const setParams = useCallback(
    (update: Partial<WebhookListParams>, { replace = false } = {}) =>
      setSearchParams((current) => toListQuery({ ...readListParams(current), ...update }), {
        replace,
      }),
    [setSearchParams],
  )

  // An invalid `?page=` already reads as page 1; drop it from the address as well,
  // replacing the entry so "back" does not return to the broken URL.
  const rawPage = searchParams.get("page")
  useEffect(() => {
    if (rawPage !== null && parsePage(rawPage) === null) setParams({}, { replace: true })
  }, [rawPage, setParams])

  return [params, setParams] as const
}
