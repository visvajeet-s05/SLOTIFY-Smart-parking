"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

export default function AdminLayout({ children }: any) {
  const router = useRouter()

  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === "loading") return

    const role = session?.user?.role || localStorage.getItem("role")
    if (role !== "ADMIN") {
      router.replace("/dashboard")
    }
  }, [session, status, router])

  return <>{children}</>
}