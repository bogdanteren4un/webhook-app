/**
 * Extension point for a real captcha widget (e.g. Turnstile or reCAPTCHA).
 * The mock accepts any non-empty token, so no widget is rendered.
 */
export async function getCaptchaToken(): Promise<string> {
  return "mock-captcha-token"
}
