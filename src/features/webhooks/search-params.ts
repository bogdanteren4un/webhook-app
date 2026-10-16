// `nuqs/server` holds the isomorphic parsers: unlike the `nuqs` entry (a client module),
// it can be evaluated in server components that import these helpers.
import { createParser, createSerializer, parseAsString } from "nuqs/server"

import { routes } from "@/lib/routes"

import type { WebhookListParams } from "./schemas"

/** Anything but a positive integer (`abc`, `0`, `-1`) falls back to the first page. */
const parseAsPage = createParser({
  parse: (value) => {
    const page = Number(value)
    return Number.isInteger(page) && page >= 1 ? page : null
  },
  serialize: String,
})

/** List state lives in the URL, so reloads and back/forward restore it. */
export const webhookListParsers = {
  page: parseAsPage.withDefault(1),
  search: parseAsString.withDefault(""),
}

// Default values (page 1, empty search) are left out of the URL.
const serializeListParams = createSerializer(webhookListParsers)

export function webhookListHref(params: Partial<WebhookListParams>): string {
  return serializeListParams(routes.webhooks, params)
}

/** The edit page keeps the list params, so "back to list" restores the same view. */
export function webhookEditHref(id: number, params: Partial<WebhookListParams>): string {
  return serializeListParams(routes.webhook(id), params)
}
