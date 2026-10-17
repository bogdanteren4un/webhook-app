"use client"

import { useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router"
import { useEffect } from "react"
import { toast } from "sonner"

import { apiClient } from "@/lib/api/client"
import { loginPath, routes } from "@/lib/routes"

import { authKeys } from "../queries"

/**
 * Sends the user to the login page, with a way back to the current URL, whenever a
 * protected request finds no valid session. The login page then drops cached data.
 * May fire several times in a row (one per rejected request), so it is idempotent.
 */
export function SessionExpiryListener() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  useEffect(
    () =>
      apiClient.onSessionExpired(() => {
        const { pathname, search } = window.location
        if (pathname === routes.login) return

        void navigate(loginPath(`${pathname}${search}`), { replace: true })
        if (queryClient.getQueryData(authKeys.me)) {
          toast.info("Your session has expired. Please sign in again.", { id: "session-expired" })
        }
      }),
    [queryClient, navigate],
  )

  return null
}
