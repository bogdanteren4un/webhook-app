import { Suspense } from "react"

import { EditWebhook, WebhookEditorSkeleton } from "@/features/webhooks/components/edit-webhook"

export function EditWebhookPage() {
  return (
    <div className="flex flex-col gap-6">
      <title>Edit webhook — Smart Sender</title>
      <h1 className="text-2xl font-semibold">Edit webhook</h1>
      {/* The id and the list params come from the URL, which is only known per request. */}
      <Suspense fallback={<WebhookEditorSkeleton />}>
        <EditWebhook />
      </Suspense>
    </div>
  )
}
