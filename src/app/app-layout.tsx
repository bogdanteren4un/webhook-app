import { Outlet } from "react-router"

import { AppHeader } from "@/components/app-header"

/**
 * Shell of the signed-in area. Access is enforced by the API: the header loads
 * /v1/me, and a session that cannot be restored ends on /login?next=<this URL>
 * (see SessionExpiryListener). Pages render right away and show their own
 * loading states, so /v1/me and page data load in parallel.
 */
export function AppLayout() {
  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <Outlet />
      </main>
    </>
  )
}
