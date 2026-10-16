import type { ReactNode } from "react"

import { AppHeader } from "@/components/app-header"

/**
 * Shell of the signed-in area. Access is enforced by the API: the header loads
 * /v1/me, and a session that cannot be restored ends on /login?next=<this URL>
 * (see SessionExpiryListener). Pages render right away and show their own
 * loading states, so /v1/me and page data load in parallel.
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
    </>
  )
}
