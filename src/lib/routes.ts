export const routes = {
  login: "/login",
  webhooks: "/webhooks",
} as const

/** Login URL that brings the user back to `returnTo` after signing in. */
export function loginPath(returnTo?: string): string {
  return returnTo ? `${routes.login}?next=${encodeURIComponent(returnTo)}` : routes.login
}

const PLACEHOLDER_ORIGIN = "http://placeholder.local"

/**
 * Resolves `?next=` to a same-origin path, falling back to the webhook list.
 * Parsing with URL also rejects tricks like `//evil.com` or `/\evil.com`.
 */
export function safeRedirectPath(next: string | null | undefined): string {
  if (!next?.startsWith("/")) return routes.webhooks

  const url = new URL(next, PLACEHOLDER_ORIGIN)
  if (url.origin !== PLACEHOLDER_ORIGIN || url.pathname === routes.login) return routes.webhooks

  return `${url.pathname}${url.search}${url.hash}`
}
