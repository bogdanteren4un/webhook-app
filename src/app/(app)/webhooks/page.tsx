import type { Metadata } from "next"
import { Suspense } from "react"

import { WebhooksList } from "@/features/webhooks/components/webhooks-list"
import { WebhooksTableSkeleton } from "@/features/webhooks/components/webhooks-table"

export const metadata: Metadata = {
  title: "Webhooks — Smart Sender",
}

export default function WebhooksPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Webhooks</h1>
      {/* The list reads its state from the URL, which is only known in the browser. */}
      <Suspense fallback={<WebhooksTableSkeleton />}>
        <WebhooksList />
      </Suspense>
    </div>
  )
}
