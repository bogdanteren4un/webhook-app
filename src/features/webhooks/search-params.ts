import { createParser, createSerializer, parseAsString, useQueryStates } from "nuqs"

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

export function useWebhookListParams() {
  // Every committed change is a history entry, so back/forward walks through them.
  return useQueryStates(webhookListParsers, { history: "push" })
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
