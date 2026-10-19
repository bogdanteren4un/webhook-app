import { delay, http, HttpResponse } from "msw"

import type { FieldErrors } from "@/lib/api/errors"

import { CSRF_TOKEN, db, DEMO_CREDENTIALS, randomToken, startSession } from "../db"
import { apiPath, errors, readJsonBody, rejectRequest, stringField } from "../http"

const FINGERPRINT_PATTERN = /^[0-9a-f]{32}$/

export const authHandlers = [
  http.get(apiPath("/csrf"), async ({ request }) => {
    await delay()
    const rejection = rejectRequest(request, { auth: false })
    if (rejection) return rejection

    return new HttpResponse(null, { status: 204, headers: { "X-CSRF-TOKEN": CSRF_TOKEN } })
  }),

  http.post(apiPath("/auth/login"), async ({ request }) => {
    await delay()
    const rejection = rejectRequest(request, { auth: false })
    if (rejection) return rejection

    if (!request.headers.get("X-Captcha-Token")?.trim()) {
      return errors.validation({ captcha: ["The captcha verification failed."] })
    }

    const body = await readJsonBody(request)
    const email = stringField(body, "email").trim()
    const password = stringField(body, "password")
    const fingerprint = stringField(body, "fingerprint")

    const fieldErrors: FieldErrors = {}
    if (!email) fieldErrors.email = ["The email field is required."]
    if (!password) fieldErrors.password = ["The password field is required."]
    if (!FINGERPRINT_PATTERN.test(fingerprint)) {
      fieldErrors.fingerprint = ["The fingerprint must be 32 hexadecimal characters."]
    }
    if (Object.keys(fieldErrors).length > 0) return errors.validation(fieldErrors)

    if (email.toLowerCase() !== db.user.email) {
      return errors.validation({ email: ["These credentials do not match our records."] })
    }
    if (password !== DEMO_CREDENTIALS.password) {
      return errors.validation({ password: ["The provided password is incorrect."] })
    }

    const deviceSessionToken = randomToken()
    db.deviceSessions.set(deviceSessionToken, { userId: db.user.id, fingerprint })
    return HttpResponse.json({ device_session_token: deviceSessionToken })
  }),

  http.post(apiPath("/auth/token/issue"), async ({ request }) => {
    await delay()
    const rejection = rejectRequest(request, { auth: false })
    if (rejection) return rejection

    const body = await readJsonBody(request)
    const token = stringField(body, "device_session_token")
    const fingerprint = stringField(body, "fingerprint")
    const deviceSession = db.deviceSessions.get(token)

    if (!deviceSession || deviceSession.fingerprint !== fingerprint) {
      return errors.validation({
        device_session_token: ["The device session token is invalid or has expired."],
      })
    }

    db.deviceSessions.delete(token)
    startSession(deviceSession.userId, fingerprint)
    return new HttpResponse(null, { status: 200 })
  }),

  http.post(apiPath("/auth/token/rotate"), async ({ request }) => {
    await delay()
    const rejection = rejectRequest(request, { auth: false })
    if (rejection) return rejection

    const body = await readJsonBody(request)
    const fingerprint = stringField(body, "fingerprint")

    // Before issue and after revoke there is nothing to rotate.
    if (!db.session || db.session.fingerprint !== fingerprint) {
      return errors.badRequest("There is no session to rotate.")
    }

    startSession(db.session.userId, fingerprint)
    return new HttpResponse(null, { status: 200 })
  }),

  http.post(apiPath("/auth/token/revoke"), async ({ request }) => {
    await delay()
    const rejection = rejectRequest(request, { auth: false })
    if (rejection) return rejection

    const body = await readJsonBody(request)
    if (db.session?.fingerprint === stringField(body, "fingerprint")) {
      db.session = null
    }
    return new HttpResponse(null, { status: 204 })
  }),

  http.get(apiPath("/v1/me"), async ({ request }) => {
    await delay()
    const rejection = rejectRequest(request, { auth: true })
    if (rejection) return rejection

    return HttpResponse.json(db.user)
  }),
]
