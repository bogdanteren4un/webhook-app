import { CircleAlertIcon } from "lucide-react"
import { isRouteErrorResponse, Link, useRouteError } from "react-router"

import { Button, buttonVariants } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { routes } from "@/lib/routes"

/**
 * Shown instead of the whole route tree when rendering throws. It replaces the root
 * layout, so it must not rely on the app providers (query client, toasts).
 */
export function RouteErrorPage() {
  const error = useRouteError()
  const detail = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}.`
    : "An unexpected error stopped this page from rendering."

  return (
    <main className="flex flex-1 items-center justify-center p-4">
      <title>Something went wrong — Smart Sender</title>
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CircleAlertIcon />
          </EmptyMedia>
          <EmptyTitle>Something went wrong</EmptyTitle>
          <EmptyDescription>
            {detail} Reload the page or go back to the webhook list.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="flex-row justify-center">
          <Button onClick={() => window.location.reload()}>Reload</Button>
          <Link to={routes.webhooks} className={buttonVariants({ variant: "outline" })}>
            Go to webhooks
          </Link>
        </EmptyContent>
      </Empty>
    </main>
  )
}
