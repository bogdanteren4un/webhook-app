"use client"

import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { toast } from "sonner"

import { apiClient } from "@/lib/api/client"
import { loginPath, routes } from "@/lib/routes"

import { authKeys } from "../queries"

/**
 * Reacts to a session the API client could not restore: sends the user to the
 * login page with a link back to the current URL and drops all cached user data.
 */
export function SessionExpiryListener() {
  const router = useRouter()
  const queryClient = useQueryClient()

  useEffect(
    () =>
      apiClient.onSessionExpired(() => {
        const wasSignedIn = queryClient.getQueryData(authKeys.me) !== undefined
        const { pathname, search } = window.location

        if (pathname !== routes.login) router.replace(loginPath(`${pathname}${search}`))
        queryClient.clear()

        if (wasSignedIn) toast.info("Your session has expired. Please sign in again.")
      }),
    [queryClient, router],
  )

  return null
}
