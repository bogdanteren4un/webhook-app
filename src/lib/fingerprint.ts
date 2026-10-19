const STORAGE_KEY = "smart-sender.fingerprint"
const FINGERPRINT_PATTERN = /^[0-9a-f]{32}$/

let inMemoryFingerprint: string | undefined

function generateFingerprint(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("")
}

/**
 * Stable device identifier (32 hex chars): generated once and kept in localStorage.
 * Falls back to memory when storage is unavailable (private mode, SSR, tests).
 */
export function getFingerprint(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && FINGERPRINT_PATTERN.test(stored)) return stored

    const fingerprint = generateFingerprint()
    localStorage.setItem(STORAGE_KEY, fingerprint)
    return fingerprint
  } catch {
    inMemoryFingerprint ??= generateFingerprint()
    return inMemoryFingerprint
  }
}
