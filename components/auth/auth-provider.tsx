"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status !== "authenticated") return

    const role = session?.user?.role
    if (!role) return

    if (role === "ADMIN") router.replace("/dashboard/admin")
    else if (role === "OWNER") router.replace("/dashboard/owner")
    else router.replace("/dashboard")
  }, [status, session])

  return <>{children}</>
}
