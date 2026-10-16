import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"

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

export function useSignOut() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: revokeSession,
    // Sign out locally even if the revoke request fails.
    onSettled: () => {
      router.replace(routes.login)
      queryClient.clear()
    },
  })
}
