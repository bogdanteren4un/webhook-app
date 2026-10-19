import type { Me } from "@/features/auth/schemas"
import type { Webhook } from "@/features/webhooks/schemas"

export const SESSION_TTL_MS = 30_000
export const CSRF_TOKEN = "d3b07384d113edec49eaa6238ad5ff00"

export const DEMO_CREDENTIALS = {
  email: "demo@smartsender.test",
  password: "Demo1234!",
} as const

type Session = {
  userId: number
  fingerprint: string
  expiresAt: number
}

type DeviceSession = {
  userId: number
  fingerprint: string
}

const EVENTS = [
  "Order created",
  "Order paid",
  "Order shipped",
  "Order refunded",
  "Cart abandoned",
  "Subscriber joined",
  "Subscriber left",
  "Message delivered",
  "Message failed",
  "Payment failed",
  "Invoice issued",
  "Lead captured",
  "Ticket opened",
  "Ticket closed",
]
const TARGETS = ["CRM", "Analytics"]

function slugify(value: string): string {
  return value.toLowerCase().replace(/\s+/g, "-")
}

function seedWebhooks(): Webhook[] {
  const firstCreatedAt = Date.UTC(2026, 0, 5, 9, 30)

  return TARGETS.flatMap((target) => EVENTS.map((event) => ({ event, target }))).map(
    ({ event, target }, index) => {
      const id = index + 1
      return {
        id,
        name: `${event} → ${target}`,
        url: `https://hooks.example.com/${slugify(target)}/${slugify(event)}`,
        active: id % 3 !== 0,
        created_at: new Date(firstCreatedAt + index * 86_400_000).toISOString(),
      }
    },
  )
}

function createState() {
  const user: Me = {
    id: 1,
    email: DEMO_CREDENTIALS.email,
    first_name: "Demo",
    last_name: "User",
    name: "Demo User",
  }

  return {
    user,
    webhooks: seedWebhooks(),
    /** device_session_token → owner; a token can be exchanged for a session once. */
    deviceSessions: new Map<string, DeviceSession>(),
    /** Server-side session, the analog of an HttpOnly cookie the client never sees. */
    session: null as Session | null,
  }
}

/** In-memory "database". Lives in page memory, so a reload resets it. */
export const db = createState()

export function resetDb(): void {
  Object.assign(db, createState())
}

export function startSession(userId: number, fingerprint: string): void {
  db.session = { userId, fingerprint, expiresAt: Date.now() + SESSION_TTL_MS }
}

export function getActiveSession(): Session | null {
  return db.session && db.session.expiresAt > Date.now() ? db.session : null
}

export function randomToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(24))
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("")
}
