import { apiClient } from "@/lib/api/client"

import {
  webhookListSchema,
  webhookSchema,
  type WebhookFormValues,
  type WebhookListParams,
} from "./schemas"

export const WEBHOOKS_PAGE_SIZE = 10

export function fetchWebhooks({ page, search }: WebhookListParams, signal?: AbortSignal) {
  const query = new URLSearchParams({ page: String(page), limit: String(WEBHOOKS_PAGE_SIZE) })
  if (search) query.set("search", search)

  return apiClient.request("GET", `/v1/webhooks?${query}`, { schema: webhookListSchema, signal })
}

export function fetchWebhook(id: number, signal?: AbortSignal) {
  return apiClient.request("GET", `/v1/webhooks/${id}`, { schema: webhookSchema, signal })
}

export function updateWebhook(id: number, values: WebhookFormValues) {
  return apiClient.request("PUT", `/v1/webhooks/${id}`, { body: values, schema: webhookSchema })
}
