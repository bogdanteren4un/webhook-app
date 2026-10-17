import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

import { getPageItems } from "../pagination"
import { webhookListHref } from "../search-params"

const disabledLinkProps = {
  "aria-disabled": true,
  tabIndex: -1,
  className: "pointer-events-none opacity-50",
} as const

type WebhooksPaginationProps = {
  page: number
  lastPage: number
  search: string
}

export function WebhooksPagination({ page, lastPage, search }: WebhooksPaginationProps) {
  if (lastPage <= 1) return null

  return (
    <Pagination className="mx-0 w-auto">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={webhookListHref({ page: page - 1, search })}
            {...(page <= 1 ? disabledLinkProps : {})}
          />
        </PaginationItem>
        {getPageItems(page, lastPage).map((item, index) =>
          item === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={item}>
              <PaginationLink
                href={webhookListHref({ page: item, search })}
                isActive={item === page}
                aria-label={`Page ${item}`}
              >
                {item}
              </PaginationLink>
            </PaginationItem>
          ),
        )}
        <PaginationItem>
          <PaginationNext
            href={webhookListHref({ page: page + 1, search })}
            {...(page >= lastPage ? disabledLinkProps : {})}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
