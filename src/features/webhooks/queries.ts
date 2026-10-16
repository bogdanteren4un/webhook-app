import { keepPreviousData, queryOptions, useQuery } from "@tanstack/react-query"

import { fetchWebhooks } from "./api"
import type { WebhookListParams } from "./schemas"

export const webhookKeys = {
  all: ["webhooks"] as const,
  lists: () => [...webhookKeys.all, "list"] as const,
  list: (params: WebhookListParams) => [...webhookKeys.lists(), params] as const,
}

export function webhookListQueryOptions(params: WebhookListParams) {
  return queryOptions({
    queryKey: webhookKeys.list(params),
    queryFn: ({ signal }) => fetchWebhooks(params, signal),
    // Keep showing the current page while the next one loads.
    placeholderData: keepPreviousData,
  })
}

export function useWebhookList(params: WebhookListParams) {
  return useQuery(webhookListQueryOptions(params))
}
