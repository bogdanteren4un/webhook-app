import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import { fetchWebhook, fetchWebhooks, updateWebhook } from "./api"
import type { WebhookFormValues, WebhookListParams } from "./schemas"

export const webhookKeys = {
  all: ["webhooks"] as const,
  lists: () => [...webhookKeys.all, "list"] as const,
  list: (params: WebhookListParams) => [...webhookKeys.lists(), params] as const,
  details: () => [...webhookKeys.all, "detail"] as const,
  detail: (id: number) => [...webhookKeys.details(), id] as const,
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

export function webhookQueryOptions(id: number) {
  return queryOptions({
    queryKey: webhookKeys.detail(id),
    queryFn: ({ signal }) => fetchWebhook(id, signal),
  })
}

export function useWebhook(id: number) {
  return useQuery(webhookQueryOptions(id))
}

export function useUpdateWebhook() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, values }: { id: number; values: WebhookFormValues }) =>
      updateWebhook(id, values),
    onSuccess: (webhook) => {
      queryClient.setQueryData(webhookKeys.detail(webhook.id), webhook)
      // A renamed webhook can move in or out of search results: refetch the lists.
      void queryClient.invalidateQueries({ queryKey: webhookKeys.lists() })
    },
  })
}
