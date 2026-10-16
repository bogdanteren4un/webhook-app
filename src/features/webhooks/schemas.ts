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

function isHttpUrl(value: string): boolean {
  if (!URL.canParse(value)) return false
  const { protocol } = new URL(value)
  return protocol === "http:" || protocol === "https:"
}

/** Mirrors the server rules for instant feedback; the server stays the source of truth. */
export const webhookFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(255, "Name is too long"),
  url: z
    .string()
    .trim()
    .min(1, "URL is required")
    .refine(isHttpUrl, "Enter a valid http:// or https:// URL"),
})

export type WebhookFormValues = z.infer<typeof webhookFormSchema>
