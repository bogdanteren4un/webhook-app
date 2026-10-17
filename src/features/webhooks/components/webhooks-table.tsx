import { Link } from "react-router"

import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { WEBHOOKS_PAGE_SIZE } from "../api"
import type { Webhook, WebhookListParams } from "../schemas"
import { webhookEditHref } from "../search-params"

function WebhooksTableHeader() {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-2/5">Name</TableHead>
        <TableHead>URL</TableHead>
        <TableHead className="w-28">Status</TableHead>
      </TableRow>
    </TableHeader>
  )
}

type WebhooksTableProps = {
  webhooks: Webhook[]
  /** Carried over to the edit links, so returning to the list restores the same view. */
  listParams: WebhookListParams
}

export function WebhooksTable({ webhooks, listParams }: WebhooksTableProps) {
  return (
    <Table className="table-fixed">
      <WebhooksTableHeader />
      <TableBody>
        {webhooks.map((webhook) => (
          <TableRow key={webhook.id}>
            <TableCell className="truncate font-medium">
              <Link to={webhookEditHref(webhook.id, listParams)} className="hover:underline">
                {webhook.name}
              </Link>
            </TableCell>
            <TableCell className="truncate text-muted-foreground" title={webhook.url}>
              {webhook.url}
            </TableCell>
            <TableCell>
              <Badge variant={webhook.active ? "default" : "outline"}>
                {webhook.active ? "Active" : "Inactive"}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export function WebhooksTableSkeleton() {
  return (
    <Table className="table-fixed" aria-busy="true" aria-label="Loading webhooks">
      <WebhooksTableHeader />
      <TableBody>
        {Array.from({ length: WEBHOOKS_PAGE_SIZE }, (_, index) => (
          <TableRow key={index}>
            <TableCell>
              <Skeleton className="h-4 w-3/4" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-full" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-5 w-16" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
