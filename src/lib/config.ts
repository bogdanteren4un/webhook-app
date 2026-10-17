/** Path prefix of every API endpoint from the contract (e.g. `/api/v1/me`). */
export const API_BASE_PATH = "/api"

/** There is no real backend, so the MSW mock is on unless explicitly disabled. */
export const isApiMockingEnabled = import.meta.env.VITE_API_MOCKING !== "disabled"
