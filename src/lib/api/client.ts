import { API_BASE_PATH, isApiMockingEnabled } from "@/lib/config"
import { getFingerprint } from "@/lib/fingerprint"

import { HttpClient } from "./http-client"

/**
 * The app-wide API client. With mocking on, every request first waits for the
 * MSW worker; this is the only place where app code reaches into `src/mocks`.
 */
export const apiClient = new HttpClient({
  baseUrl: API_BASE_PATH,
  getFingerprint,
  ready: isApiMockingEnabled
    ? () => import("@/mocks/enable-mocking").then(({ enableMocking }) => enableMocking())
    : undefined,
})
