import { WebhooksList } from "@/features/webhooks/components/webhooks-list"

export function WebhooksPage() {
  return (
    <div className="flex flex-col gap-6">
      <title>Webhooks — Smart Sender</title>
      <h1 className="text-2xl font-semibold">Webhooks</h1>
      <WebhooksList />
    </div>
  )
}
