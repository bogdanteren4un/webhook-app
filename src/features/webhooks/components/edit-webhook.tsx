import { ArrowLeftIcon, SearchXIcon } from "lucide-react"
import { Link, useParams } from "react-router"

import { LoadError } from "@/components/load-error"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { getErrorMessage, isApiError } from "@/lib/api/errors"

import { useWebhook } from "../queries"
import { webhookIdSchema } from "../schemas"
import { useWebhookListParams, webhookListHref } from "../search-params"
import { WebhookEditForm } from "./webhook-edit-form"

const dateFormat = new Intl.DateTimeFormat("en", { dateStyle: "medium" })

export function EditWebhook() {
  const params = useParams<{ id: string }>()
  // The edit URL carries the list params, so "back" returns to the same page and search.
  const [listParams] = useWebhookListParams()
  const backHref = webhookListHref(listParams)
  const id = webhookIdSchema.safeParse(params.id)

  return (
    <div className="flex flex-col gap-4">
      <Link
        to={backHref}
        className={buttonVariants({ variant: "ghost", size: "sm", className: "self-start" })}
      >
        <ArrowLeftIcon />
        Back to webhooks
      </Link>
      {id.success ? (
        <WebhookEditor id={id.data} backHref={backHref} />
      ) : (
        <WebhookNotFound backHref={backHref} />
      )}
    </div>
  )
}

function WebhookEditor({ id, backHref }: { id: number; backHref: string }) {
  const { data: webhook, error, isError, refetch } = useWebhook(id)

  if (isApiError(error, 404)) return <WebhookNotFound backHref={backHref} />
  if (!webhook) {
    return isError ? (
      <LoadError
        title="Could not load the webhook"
        message={getErrorMessage(error)}
        onRetry={() => void refetch()}
      />
    ) : (
      <WebhookEditorSkeleton />
    )
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{webhook.name}</CardTitle>
        <CardDescription>Created {dateFormat.format(new Date(webhook.created_at))}</CardDescription>
        <CardAction>
          <Badge variant={webhook.active ? "default" : "outline"}>
            {webhook.active ? "Active" : "Inactive"}
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <WebhookEditForm key={webhook.id} webhook={webhook} backHref={backHref} />
      </CardContent>
    </Card>
  )
}

function WebhookEditorSkeleton() {
  return (
    <Card className="max-w-2xl" aria-busy="true" aria-label="Loading webhook">
      <CardHeader>
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-32" />
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-32" />
      </CardContent>
    </Card>
  )
}

function WebhookNotFound({ backHref }: { backHref: string }) {
  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <SearchXIcon />
        </EmptyMedia>
        <EmptyTitle>Webhook not found</EmptyTitle>
        <EmptyDescription>It may have been deleted, or the link is wrong.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Link to={backHref} className={buttonVariants({ variant: "outline" })}>
          Back to webhooks
        </Link>
      </EmptyContent>
    </Empty>
  )
}
