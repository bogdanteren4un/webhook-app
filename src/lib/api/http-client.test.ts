import { http } from "msw"
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest"

import { loginResponseSchema, meSchema } from "@/features/auth/schemas"
import { webhookListSchema, webhookSchema } from "@/features/webhooks/schemas"
import { DEMO_CREDENTIALS, resetDb, SESSION_TTL_MS } from "@/mocks/db"
import { apiPath, errors } from "@/mocks/http"
import { server } from "@/mocks/node"

import { SessionExpiredError } from "./errors"
import { HttpClient } from "./http-client"

const FINGERPRINT = "0123456789abcdef0123456789abcdef"

function createClient() {
  const client = new HttpClient({
    baseUrl: "http://localhost",
    getFingerprint: () => FINGERPRINT,
  })
  const onSessionExpired = vi.fn()
  client.onSessionExpired(onSessionExpired)
  return { client, onSessionExpired }
}

async function signIn(client: HttpClient) {
  const { device_session_token } = await client.request("POST", "/auth/login", {
    auth: false,
    headers: { "X-Captcha-Token": "test" },
    body: { ...DEMO_CREDENTIALS, fingerprint: FINGERPRINT },
    schema: loginResponseSchema,
  })
  await client.request("POST", "/auth/token/issue", {
    auth: false,
    body: { device_session_token, fingerprint: FINGERPRINT },
  })
  client.startSession()
}

function expireMockSession() {
  vi.useFakeTimers({ toFake: ["Date"] })
  vi.setSystemTime(Date.now() + SESSION_TTL_MS + 1_000)
}

/** Counts requests that reach the mock, by path. */
function countRequests() {
  const counts = new Map<string, number>()
  server.events.on("request:start", ({ request }) => {
    const { pathname } = new URL(request.url)
    counts.set(pathname, (counts.get(pathname) ?? 0) + 1)
  })
  return (path: string) => counts.get(path) ?? 0
}

beforeAll(() => server.listen({ onUnhandledFrame: "error" }))
afterEach(() => {
  server.resetHandlers()
  server.events.removeAllListeners()
  resetDb()
  vi.useRealTimers()
})
afterAll(() => server.close())

describe("HttpClient", () => {
  it("shares one rotate between parallel 401s and retries both requests", async () => {
    const { client, onSessionExpired } = createClient()
    await signIn(client)
    expireMockSession()
    const requestsTo = countRequests()

    const [me, webhooks] = await Promise.all([
      client.request("GET", "/v1/me", { schema: meSchema }),
      client.request("GET", "/v1/webhooks?page=1&limit=10", { schema: webhookListSchema }),
    ])

    expect(me.email).toBe(DEMO_CREDENTIALS.email)
    expect(webhooks.data).toHaveLength(10)
    expect(requestsTo("/auth/token/rotate")).toBe(1)
    expect(requestsTo("/v1/me")).toBe(2)
    expect(requestsTo("/v1/webhooks")).toBe(2)
    expect(onSessionExpired).not.toHaveBeenCalled()
  })

  it("ends the session when the rotate fails and fails later requests fast", async () => {
    // No login: the mock has no session, so rotate answers 400.
    const { client, onSessionExpired } = createClient()
    const requestsTo = countRequests()

    const results = await Promise.allSettled([
      client.request("GET", "/v1/me", { schema: meSchema }),
      client.request("GET", "/v1/webhooks", { schema: webhookListSchema }),
    ])

    expect(results.map((result) => result.status)).toEqual(["rejected", "rejected"])
    for (const result of results) {
      if (result.status === "rejected") expect(result.reason).toBeInstanceOf(SessionExpiredError)
    }
    expect(requestsTo("/auth/token/rotate")).toBe(1)
    expect(onSessionExpired).toHaveBeenCalledOnce()

    // Later protected requests skip the network but still report the missing session,
    // e.g. when the user navigates back to a protected page.
    await expect(client.request("GET", "/v1/me")).rejects.toBeInstanceOf(SessionExpiredError)
    expect(requestsTo("/v1/me")).toBe(1)
    expect(onSessionExpired).toHaveBeenCalledTimes(2)
  })

  it("refetches the CSRF token on 419 and retries the request once", async () => {
    const { client } = createClient()
    await signIn(client)
    server.use(http.put(apiPath("/v1/webhooks/:id"), () => errors.tokenMismatch(), { once: true }))
    const requestsTo = countRequests()

    const webhook = await client.request("PUT", "/v1/webhooks/1", {
      body: { name: "Renamed", url: "https://example.com/hook" },
      schema: webhookSchema,
    })

    expect(webhook.name).toBe("Renamed")
    expect(requestsTo("/csrf")).toBe(1)
    expect(requestsTo("/v1/webhooks/1")).toBe(2)
  })
})
