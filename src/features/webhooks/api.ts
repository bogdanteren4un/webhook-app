import { apiClient } from "@/lib/api/client"

import { webhookListSchema, type WebhookListParams } from "./schemas"

export const WEBHOOKS_PAGE_SIZE = 10

export function fetchWebhooks({ page, search }: WebhookListParams, signal?: AbortSignal) {
  const query = new URLSearchParams({ page: String(page), limit: String(WEBHOOKS_PAGE_SIZE) })
  if (search) query.set("search", search)

  return apiClient.request("GET", `/v1/webhooks?${query}`, { schema: webhookListSchema, signal })
}
