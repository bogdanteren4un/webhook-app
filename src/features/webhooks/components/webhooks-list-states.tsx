import { SearchXIcon, WebhookIcon } from "lucide-react"
import { Link } from "react-router"

import { Button, buttonVariants } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

import { webhookListHref } from "../search-params"

export function NoWebhooks() {
  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <WebhookIcon />
        </EmptyMedia>
        <EmptyTitle>No webhooks yet</EmptyTitle>
        <EmptyDescription>Webhooks you create will show up here.</EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}

export function NoSearchResults({ search, onClear }: { search: string; onClear: () => void }) {
  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <SearchXIcon />
        </EmptyMedia>
        <EmptyTitle>No matching webhooks</EmptyTitle>
        <EmptyDescription>No webhook name contains “{search}”.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline" onClick={onClear}>
          Clear search
        </Button>
      </EmptyContent>
    </Empty>
  )
}

export function PageOutOfRange({ lastPage, search }: { lastPage: number; search: string }) {
  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyTitle>This page does not exist</EmptyTitle>
        <EmptyDescription>
          The list has {lastPage} {lastPage === 1 ? "page" : "pages"}.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Link
          to={webhookListHref({ page: lastPage, search })}
          className={buttonVariants({ variant: "outline" })}
        >
          Go to the last page
        </Link>
      </EmptyContent>
    </Empty>
  )
}
