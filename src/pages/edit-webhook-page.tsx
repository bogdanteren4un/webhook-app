import { EditWebhook } from "@/features/webhooks/components/edit-webhook"

export function EditWebhookPage() {
  return (
    <div className="flex flex-col gap-6">
      <title>Edit webhook — Smart Sender</title>
      <h1 className="text-2xl font-semibold">Edit webhook</h1>
      <EditWebhook />
    </div>
  )
}
