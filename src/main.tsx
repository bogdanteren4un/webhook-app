import "@fontsource-variable/geist"
import "./index.css"

import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { RouterProvider } from "react-router/dom"

import { isApiMockingEnabled } from "@/lib/config"

import { router } from "./app/router"

const container = document.getElementById("root")
if (!container) throw new Error("The #root element is missing in index.html")
const root = createRoot(container)

/** There is no real backend: the mock must intercept requests before the first one is sent. */
async function startApiMocking(): Promise<void> {
  if (!isApiMockingEnabled) return
  const { enableMocking } = await import("./mocks/enable-mocking")
  await enableMocking()
}

startApiMocking().then(
  () =>
    root.render(
      <StrictMode>
        <RouterProvider router={router} />
      </StrictMode>,
    ),
  (error: unknown) => {
    console.error("Failed to start the API mock", error)
    root.render(
      <p role="alert" className="p-6 text-sm text-destructive">
        The mock API could not start. Open the app over http://localhost in a browser with Service
        Worker support.
      </p>,
    )
  },
)
