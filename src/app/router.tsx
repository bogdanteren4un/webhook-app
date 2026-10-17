import { createBrowserRouter, Navigate } from "react-router"

import { routes } from "@/lib/routes"
import { EditWebhookPage } from "@/pages/edit-webhook-page"
import { LoginPage } from "@/pages/login-page"
import { NotFoundPage } from "@/pages/not-found-page"
import { RouteErrorPage } from "@/pages/route-error-page"
import { WebhooksPage } from "@/pages/webhooks-page"

import { AppLayout } from "./app-layout"
import { RootLayout } from "./root-layout"

export const router = createBrowserRouter([
  {
    // Providers live inside the router: the session listener navigates through it.
    element: <RootLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      { path: "/", element: <Navigate to={routes.webhooks} replace /> },
      { path: routes.login, element: <LoginPage /> },
      {
        element: <AppLayout />,
        children: [
          { path: routes.webhooks, element: <WebhooksPage /> },
          { path: "/webhooks/:id", element: <EditWebhookPage /> },
        ],
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
])
