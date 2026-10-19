import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router"
import { useEffect } from "react"

import { routes } from "@/lib/routes"

import { fetchMe, issueSession, login, revokeSession } from "./api"
import type { LoginFormValues } from "./schemas"

export const authKeys = {
  me: ["auth", "me"] as const,
}

export const meQueryOptions = queryOptions({
  queryKey: authKeys.me,
  queryFn: ({ signal }) => fetchMe(signal),
  staleTime: 5 * 60_000,
})

export function useCurrentUser() {
  return useQuery(meQueryOptions)
}

/**
 * login → issue → /v1/me. The device session token lives only in this function's
 * scope: it never reaches React state, the query/mutation cache, storage or the URL.
 */
export function useSignIn() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (credentials: LoginFormValues) => {
      const deviceSessionToken = await login(credentials)
      await issueSession(deviceSessionToken)
      return queryClient.fetchQuery(meQueryOptions)
    },
    // The variables hold the password: drop the mutation as soon as nothing observes it.
    gcTime: 0,
  })
}

/** Signs out locally even if the revoke request fails; the login page clears the cache. */
export function useSignOut() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: revokeSession,
    onSettled: () => navigate(routes.login, { replace: true }),
  })
}

/**
 * Drops every cached query and mutation of the previous session. Meant for the login
 * page: by the time it mounts, the protected pages have unmounted and no longer observe
 * their queries. Clearing earlier (e.g. right after navigate() on sign-out) could make a
 * still-mounted page refetch, fail and redirect again with a stale ?next.
 */
export function useClearSessionData() {
  const queryClient = useQueryClient()
  useEffect(() => {
    queryClient.clear()
  }, [queryClient])
}
