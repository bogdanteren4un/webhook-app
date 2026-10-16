let started: Promise<void> | undefined

/**
 * Starts the MSW worker exactly once, even if called repeatedly
 * (e.g. effects running twice under React Strict Mode). A failed start
 * is not cached, so the next request tries again.
 */
export function enableMocking(): Promise<void> {
  // `msw/browser` has no Node.js export. The statically known SSR flag lets the
  // bundler drop this import from the server build of the client component.
  if (!import.meta.env.SSR) {
    started ??= import("./browser")
      .then(async ({ worker }) => {
        await worker.start({ onUnhandledFrame: "bypass" })
      })
      .catch((error: unknown) => {
        started = undefined
        throw error
      })
  }
  return started ?? Promise.resolve()
}
