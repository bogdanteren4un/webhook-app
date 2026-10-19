/**
 * Prefix for the contract paths. Empty: the mock serves them as written in the contract
 * (`/csrf`, `/v1/me`). A real backend behind a proxy would set e.g. `/api` here.
 */
export const API_BASE_PATH = ""

/** There is no real backend, so the MSW mock is on unless explicitly disabled. */
export const isApiMockingEnabled = import.meta.env.VITE_API_MOCKING !== "disabled"
