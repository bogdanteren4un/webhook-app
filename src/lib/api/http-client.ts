import type { ZodType } from "zod"

import { ApiError, SessionExpiredError } from "./errors"

export type HttpMethod = "GET" | "POST" | "PUT"

export type RequestOptions = {
  body?: unknown
  headers?: Record<string, string>
  signal?: AbortSignal
  /**
   * Protected requests take part in the 401 → rotate → retry flow. Auth endpoints
   * opt out, which also guarantees that a rotate never triggers another rotate.
   */
  auth?: boolean
}

type HttpClientOptions = {
  /** Prefix for every path: `/api` in the browser, an absolute URL in Node tests. */
  baseUrl: string
  getFingerprint: () => string
  /** Awaited before each request, e.g. until the mock service worker intercepts requests. */
  ready?: () => Promise<void>
}

const CSRF_PROTECTED_METHODS: ReadonlySet<HttpMethod> = new Set(["POST", "PUT"])

/**
 * API client that hides the session protocol from its callers:
 * - fetches the CSRF token before the first request and sends it on POST and PUT;
 * - on 419 refreshes the token and retries the request once;
 * - on 401 rotates the session once for all concurrent requests and retries once;
 * - ends the local session when the rotate fails or the retry gets 401 again.
 */
export class HttpClient {
  private csrfToken: Promise<string> | null = null
  private rotation: Promise<void> | null = null
  /** Bumped whenever a session starts or rotates, to tell stale 401s apart. */
  private sessionEpoch = 0
  private sessionEnded = false
  private readonly sessionExpiredListeners = new Set<() => void>()

  constructor(private readonly options: HttpClientOptions) {}

  request<T>(
    method: HttpMethod,
    path: string,
    options: RequestOptions & { schema: ZodType<T> },
  ): Promise<T>
  request(method: HttpMethod, path: string, options?: RequestOptions): Promise<void>
  async request<T>(
    method: HttpMethod,
    path: string,
    { schema, auth = true, ...init }: RequestOptions & { schema?: ZodType<T> } = {},
  ): Promise<T | void> {
    await this.options.ready?.()

    let csrfRetried = false
    let authRetried = false

    for (;;) {
      init.signal?.throwIfAborted()
      // After the session ended, protected requests fail without hitting the network.
      if (auth && this.sessionEnded) throw new SessionExpiredError()

      const csrfToken = this.getCsrfToken()
      const csrfTokenValue = await csrfToken
      const epoch = this.sessionEpoch
      const response = await this.send(method, path, init, csrfTokenValue)

      if (response.status === 419 && !csrfRetried) {
        csrfRetried = true
        this.invalidateCsrfToken(csrfToken)
        continue
      }

      if (response.status === 401 && auth) {
        if (authRetried) {
          this.expireSession()
          throw new SessionExpiredError()
        }
        authRetried = true
        await this.refreshSession(epoch)
        continue
      }

      if (!response.ok) throw await ApiError.fromResponse(response)
      return schema ? schema.parse(await response.json()) : undefined
    }
  }

  /** Call once a session has been issued: protected requests are allowed again. */
  startSession(): void {
    this.sessionEnded = false
    this.sessionEpoch += 1
  }

  /** Call on logout: protected requests fail fast until the next login. */
  endSession(): void {
    this.sessionEnded = true
  }

  /** Subscribes to an involuntary end of the session. Returns an unsubscribe function. */
  onSessionExpired(listener: () => void): () => void {
    this.sessionExpiredListeners.add(listener)
    return () => {
      this.sessionExpiredListeners.delete(listener)
    }
  }

  private getCsrfToken(): Promise<string> {
    this.csrfToken ??= this.fetchCsrfToken().catch((error: unknown) => {
      this.csrfToken = null
      throw error
    })
    return this.csrfToken
  }

  /** Drops the rejected token, unless a concurrent request has already replaced it. */
  private invalidateCsrfToken(token: Promise<string>): void {
    if (this.csrfToken === token) this.csrfToken = null
  }

  private async fetchCsrfToken(): Promise<string> {
    const response = await fetch(this.url("/csrf"), {
      credentials: "same-origin",
      headers: { "X-Requested-With": "XMLHttpRequest" },
    })
    if (!response.ok) throw await ApiError.fromResponse(response)

    const token = response.headers.get("X-CSRF-TOKEN")
    if (!token) {
      throw new ApiError(response.status, "UnknownException", "The server sent no CSRF token.")
    }
    return token
  }

  private refreshSession(epoch: number): Promise<void> {
    // The session rotated after this request was sent, so its 401 is stale: just retry.
    if (epoch !== this.sessionEpoch) return Promise.resolve()

    this.rotation ??= this.rotate().finally(() => {
      this.rotation = null
    })
    return this.rotation
  }

  private async rotate(): Promise<void> {
    try {
      await this.request("POST", "/auth/token/rotate", {
        auth: false,
        body: { fingerprint: this.options.getFingerprint() },
      })
    } catch {
      this.expireSession()
      throw new SessionExpiredError()
    }
    this.sessionEpoch += 1
  }

  private expireSession(): void {
    if (this.sessionEnded) return
    this.sessionEnded = true
    for (const listener of this.sessionExpiredListeners) listener()
  }

  private send(
    method: HttpMethod,
    path: string,
    { body, headers, signal }: Omit<RequestOptions, "auth">,
    csrfToken: string,
  ): Promise<Response> {
    return fetch(this.url(path), {
      method,
      signal,
      // A real backend keeps the session in an HttpOnly cookie.
      credentials: "same-origin",
      headers: {
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
        ...(body !== undefined && { "Content-Type": "application/json" }),
        ...(CSRF_PROTECTED_METHODS.has(method) && { "X-CSRF-TOKEN": csrfToken }),
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  }

  private url(path: string): string {
    return `${this.options.baseUrl}${path}`
  }
}
