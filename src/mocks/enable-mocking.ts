/** Starts the MSW worker; `main.tsx` renders the app only after it intercepts requests. */
export async function enableMocking(): Promise<void> {
  const { worker } = await import("./browser")
  await worker.start({ onUnhandledFrame: "bypass" })
}
