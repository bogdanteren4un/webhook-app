"use client"

import { LogOutIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"

import { useCurrentUser, useSignOut } from "../queries"

export function UserMenu() {
  const { data: user, isPending } = useCurrentUser()
  const signOut = useSignOut()

  return (
    <div className="flex items-center gap-3">
      {isPending ? (
        <Skeleton className="h-4 w-24" />
      ) : (
        user && <span className="text-sm text-muted-foreground">{user.name}</span>
      )}
      <Button
        variant="outline"
        size="sm"
        disabled={signOut.isPending}
        onClick={() => signOut.mutate()}
      >
        {signOut.isPending ? <Spinner /> : <LogOutIcon />}
        Log out
      </Button>
    </div>
  )
}
