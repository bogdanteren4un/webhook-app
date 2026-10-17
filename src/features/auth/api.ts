import { apiClient } from "@/lib/api/client"
import { getFingerprint } from "@/lib/fingerprint"

import { getCaptchaToken } from "./captcha"
import { loginResponseSchema, meSchema, type LoginFormValues } from "./schemas"

/** Exchanges credentials for a one-time device session token. */
export async function login(credentials: LoginFormValues) {
  const { device_session_token } = await apiClient.request("POST", "/auth/login", {
    auth: false,
    headers: { "X-Captcha-Token": await getCaptchaToken() },
    body: { ...credentials, fingerprint: getFingerprint() },
    schema: loginResponseSchema,
  })
  return device_session_token
}

/** Starts the server-side session. Session tokens never reach the client. */
export async function issueSession(deviceSessionToken: string) {
  await apiClient.request("POST", "/auth/token/issue", {
    auth: false,
    body: { device_session_token: deviceSessionToken, fingerprint: getFingerprint() },
  })
  apiClient.startSession()
}

/** Revokes the session on the server; the local session ends even if that fails. */
export async function revokeSession() {
  try {
    await apiClient.request("POST", "/auth/token/revoke", {
      auth: false,
      body: { fingerprint: getFingerprint() },
    })
  } finally {
    apiClient.endSession()
  }
}

/**
 * Subscribes to the loss of the session: a failed rotate, a repeated 401, or a protected
 * request after sign-out. May fire once per rejected request. Returns an unsubscribe.
 */
export function onSessionExpired(listener: () => void) {
  return apiClient.onSessionExpired(listener)
}

export function fetchMe(signal?: AbortSignal) {
  return apiClient.request("GET", "/v1/me", { schema: meSchema, signal })
}
