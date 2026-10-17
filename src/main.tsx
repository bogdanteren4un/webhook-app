import "@fontsource-variable/geist"
import "./index.css"

import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { RouterProvider } from "react-router/dom"

import { router } from "./app/router"

const container = document.getElementById("root")
if (!container) throw new Error("The #root element is missing in index.html")

createRoot(container).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
