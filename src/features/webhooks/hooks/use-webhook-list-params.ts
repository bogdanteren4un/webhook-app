import { useQueryStates } from "nuqs"

import { webhookListParsers } from "../search-params"

export function useWebhookListParams() {
  // Every committed change is a history entry, so back/forward walks through them.
  return useQueryStates(webhookListParsers, { history: "push" })
}
