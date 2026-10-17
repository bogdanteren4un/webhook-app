import { CircleAlertIcon } from "lucide-react"
import { useCallback } from "react"

import { LoadError } from "@/components/load-error"
import { Alert, AlertAction, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { getErrorMessage } from "@/lib/api/errors"

import { useWebhookList } from "../queries"
import type { Webhook, WebhookList } from "../schemas"
import { useWebhookListParams } from "../search-params"
import { NoSearchResults, NoWebhooks, PageOutOfRange } from "./webhooks-list-states"
import { WebhooksPagination } from "./webhooks-pagination"
import { WebhooksSearch } from "./webhooks-search"
import { WebhooksTable, WebhooksTableSkeleton } from "./webhooks-table"

export function WebhooksList() {
  const [{ page, search }, setParams] = useWebhookListParams()
  const { data, error, isError, isFetching, isPlaceholderData, refetch } = useWebhookList({
    page,
    search,
  })

  // A new search always starts from the first page.
  const commitSearch = useCallback(
    (value: string) => void setParams({ search: value, page: null }),
    [setParams],
  )
  const clearSearch = useCallback(() => commitSearch(""), [commitSearch])
  const retry = useCallback(() => void refetch(), [refetch])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <WebhooksSearch value={search} onCommit={commitSearch} />
        {isFetching && data && <Spinner className="text-muted-foreground" aria-label="Updating" />}
      </div>

      {!data ? (
        isError ? (
          <LoadError
            title="Could not load webhooks"
            message={getErrorMessage(error)}
            onRetry={retry}
          />
        ) : (
          <WebhooksTableSkeleton />
        )
      ) : (
        <>
          {isError && (
            <Alert variant="destructive">
              <CircleAlertIcon />
              <AlertDescription>{getErrorMessage(error)}</AlertDescription>
              <AlertAction>
                <Button size="sm" variant="outline" onClick={retry}>
                  Try again
                </Button>
              </AlertAction>
            </Alert>
          )}
          <WebhooksListBody
            page={page}
            search={search}
            webhooks={data.data}
            paging={data.paging}
            isStale={isPlaceholderData}
            onClearSearch={clearSearch}
          />
        </>
      )}
    </div>
  )
}

type WebhooksListBodyProps = {
  page: number
  search: string
  webhooks: Webhook[]
  paging: WebhookList["paging"]
  /** The previous page is shown while the requested one loads. */
  isStale: boolean
  onClearSearch: () => void
}

function WebhooksListBody({
  page,
  search,
  webhooks,
  paging,
  isStale,
  onClearSearch,
}: WebhooksListBodyProps) {
  const { total, limitation } = paging.results

  if (webhooks.length === 0) {
    if (total > 0) return <PageOutOfRange lastPage={paging.pages.last} search={search} />
    if (search) return <NoSearchResults search={search} onClear={onClearSearch} />
    return <NoWebhooks />
  }

  const from = (paging.pages.current - 1) * limitation + 1
  const to = from + webhooks.length - 1

  return (
    <>
      <div aria-busy={isStale} className={isStale ? "opacity-60 transition-opacity" : undefined}>
        <WebhooksTable webhooks={webhooks} listParams={{ page, search }} />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          Showing {from}–{to} of {total}
        </p>
        <WebhooksPagination page={page} lastPage={paging.pages.last} search={search} />
      </div>
    </>
  )
}
