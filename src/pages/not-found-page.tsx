import { Link } from "react-router"

import { buttonVariants } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import { routes } from "@/lib/routes"

export function NotFoundPage() {
  return (
    <main className="flex flex-1 items-center justify-center p-4">
      <title>Page not found — Smart Sender</title>
      <Empty>
        <EmptyHeader>
          <EmptyTitle>Page not found</EmptyTitle>
          <EmptyDescription>The address may be mistyped, or the page has moved.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Link to={routes.webhooks} className={buttonVariants({ variant: "outline" })}>
            Go to webhooks
          </Link>
        </EmptyContent>
      </Empty>
    </main>
  )
}
