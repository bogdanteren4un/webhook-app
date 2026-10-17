import { Suspense } from "react"

import { WebhooksList } from "@/features/webhooks/components/webhooks-list"
import { WebhooksTableSkeleton } from "@/features/webhooks/components/webhooks-table"

export function WebhooksPage() {
  return (
    <div className="flex flex-col gap-6">
      <title>Webhooks — Smart Sender</title>
      <h1 className="text-2xl font-semibold">Webhooks</h1>
      {/* The list reads its state from the URL, which is only known in the browser. */}
      <Suspense fallback={<WebhooksTableSkeleton />}>
        <WebhooksList />
      </Suspense>
    </div>
  )
}
