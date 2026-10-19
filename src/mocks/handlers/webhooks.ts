import { delay, http, HttpResponse } from "msw"

import type { WebhookList } from "@/features/webhooks/schemas"
import type { FieldErrors } from "@/lib/api/errors"

import { db } from "../db"
import { apiPath, errors, readJsonBody, rejectRequest, stringField } from "../http"

const DEFAULT_LIMIT = 10
const MAX_LIMIT = 100
const MAX_NAME_LENGTH = 255

function positiveInt(value: string | null, fallback: number): number {
  const number = Number(value)
  return Number.isInteger(number) && number > 0 ? number : fallback
}

function findWebhook(id: string) {
  return db.webhooks.find((webhook) => String(webhook.id) === id)
}

function isHttpUrl(value: string): boolean {
  if (!URL.canParse(value)) return false
  const { protocol } = new URL(value)
  return protocol === "http:" || protocol === "https:"
}

function validateWebhook({ name, url }: { name: string; url: string }): FieldErrors {
  const fieldErrors: FieldErrors = {}

  if (!name) fieldErrors.name = ["The name field is required."]
  else if (name.length > MAX_NAME_LENGTH) {
    fieldErrors.name = [`The name may not be greater than ${MAX_NAME_LENGTH} characters.`]
  }

  if (!url) fieldErrors.url = ["The url field is required."]
  else if (!isHttpUrl(url)) fieldErrors.url = ["The url must be a valid URL."]

  return fieldErrors
}

export const webhookHandlers = [
  http.get(apiPath("/v1/webhooks"), async ({ request }) => {
    await delay()
    const rejection = rejectRequest(request, { auth: true })
    if (rejection) return rejection

    const params = new URL(request.url).searchParams
    const page = positiveInt(params.get("page"), 1)
    const limit = Math.min(positiveInt(params.get("limit"), DEFAULT_LIMIT), MAX_LIMIT)
    const search = (params.get("search") ?? "").trim().toLowerCase()

    const matches = search
      ? db.webhooks.filter((webhook) => webhook.name.toLowerCase().includes(search))
      : db.webhooks

    return HttpResponse.json({
      data: matches.slice((page - 1) * limit, page * limit),
      paging: {
        pages: { current: page, last: Math.max(1, Math.ceil(matches.length / limit)) },
        results: { total: matches.length, limitation: limit },
      },
    } satisfies WebhookList)
  }),

  http.get<{ id: string }>(apiPath("/v1/webhooks/:id"), async ({ request, params }) => {
    await delay()
    const rejection = rejectRequest(request, { auth: true })
    if (rejection) return rejection

    const webhook = findWebhook(params.id)
    return webhook ? HttpResponse.json(webhook) : errors.notFound()
  }),

  http.put<{ id: string }>(apiPath("/v1/webhooks/:id"), async ({ request, params }) => {
    await delay()
    const rejection = rejectRequest(request, { auth: true })
    if (rejection) return rejection

    const webhook = findWebhook(params.id)
    if (!webhook) return errors.notFound()

    const body = await readJsonBody(request)
    const input = { name: stringField(body, "name").trim(), url: stringField(body, "url").trim() }
    const fieldErrors = validateWebhook(input)
    if (Object.keys(fieldErrors).length > 0) return errors.validation(fieldErrors)

    Object.assign(webhook, input)
    return HttpResponse.json(webhook)
  }),
]
