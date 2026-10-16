import { z } from "zod"

export const webhookSchema = z.object({
  id: z.number(),
  name: z.string(),
  url: z.string(),
  active: z.boolean(),
  created_at: z.string(),
})

export type Webhook = z.infer<typeof webhookSchema>

export const webhookListSchema = z.object({
  data: z.array(webhookSchema),
  paging: z.object({
    pages: z.object({ current: z.number(), last: z.number() }),
    results: z.object({ total: z.number(), limitation: z.number() }),
  }),
})

export type WebhookList = z.infer<typeof webhookListSchema>

export type WebhookListParams = {
  page: number
  search: string
}

/** Route param of the edit page: a positive integer, anything else is "not found". */
export const webhookIdSchema = z.coerce.number().int().positive()

/**
 * The client only checks required fields, for instant feedback. Format rules (an
 * http/https URL, the name length) belong to the server: its 422 messages are shown
 * next to the fields, and the rules cannot drift between client and server.
 */
export const webhookFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  url: z.string().trim().min(1, "URL is required"),
})

export type WebhookFormValues = z.infer<typeof webhookFormSchema>
