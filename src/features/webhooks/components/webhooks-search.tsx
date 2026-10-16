"use client"

import { SearchIcon, XIcon } from "lucide-react"
import { useEffect, useState } from "react"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"

const SEARCH_DEBOUNCE_MS = 300

type WebhooksSearchProps = {
  /** The committed search, as it is in the URL. */
  value: string
  onCommit: (search: string) => void
}

/**
 * The field reacts to every keystroke, while the URL (and so the request) is updated
 * only after a pause in typing. URL changes that do not come from typing, like
 * back/forward navigation, are reflected in the field.
 */
export function WebhooksSearch({ value, onCommit }: WebhooksSearchProps) {
  const [input, setInput] = useState(value)
  const [prevValue, setPrevValue] = useState(value)
  const [pendingCommit, setPendingCommit] = useState<string | null>(null)

  // Adjusting state while rendering, as React recommends instead of a syncing effect.
  // The echo of our own commit is skipped, so text typed meanwhile is never overwritten.
  if (value !== prevValue) {
    setPrevValue(value)
    if (value === pendingCommit) setPendingCommit(null)
    else setInput(value)
  }

  useEffect(() => {
    const search = input.trim()
    if (search === value) return

    const timer = setTimeout(() => {
      setPendingCommit(search)
      onCommit(search)
    }, SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [input, value, onCommit])

  return (
    <InputGroup className="max-w-sm">
      <InputGroupAddon>
        <SearchIcon />
      </InputGroupAddon>
      <InputGroupInput
        type="search"
        placeholder="Search by name"
        aria-label="Search webhooks by name"
        value={input}
        onChange={(event) => setInput(event.target.value)}
      />
      {input && (
        <InputGroupAddon align="inline-end">
          <InputGroupButton size="icon-xs" aria-label="Clear search" onClick={() => setInput("")}>
            <XIcon />
          </InputGroupButton>
        </InputGroupAddon>
      )}
    </InputGroup>
  )
}
