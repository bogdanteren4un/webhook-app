"use client"

import { QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { NuqsAdapter } from "nuqs/adapters/react-router/v7"
import { useState, type ReactNode } from "react"

import { Toaster } from "@/components/ui/sonner"
import { SessionExpiryListener } from "@/features/auth/components/session-expiry-listener"
import { createQueryClient } from "@/lib/query-client"

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient)

  return (
    <NuqsAdapter>
      <QueryClientProvider client={queryClient}>
        <SessionExpiryListener />
        {children}
        <Toaster position="top-center" />
        <ReactQueryDevtools buttonPosition="bottom-left" />
      </QueryClientProvider>
    </NuqsAdapter>
  )
}
