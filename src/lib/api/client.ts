import { API_BASE_PATH } from "@/lib/config"
import { getFingerprint } from "@/lib/fingerprint"

import { HttpClient } from "./http-client"

/** The app-wide API client. */
export const apiClient = new HttpClient({
  baseUrl: API_BASE_PATH,
  getFingerprint,
})
