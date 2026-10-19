import { authHandlers } from "./auth"
import { webhookHandlers } from "./webhooks"

export const handlers = [...authHandlers, ...webhookHandlers]
