import { Link } from "react-router"

import { UserMenu } from "@/features/auth/components/user-menu"
import { routes } from "@/lib/routes"

export function AppHeader() {
  return (
    <header className="border-b">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
        <Link to={routes.webhooks} className="font-semibold">
          Smart Sender
        </Link>
        <UserMenu />
      </div>
    </header>
  )
}
