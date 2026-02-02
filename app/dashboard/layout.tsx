"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { isSessionValid } from "@/lib/checkSession"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  useEffect(() => {
    if (!isSessionValid()) {
      localStorage.clear()
      router.replace("/")
    }
  }, [])

  return <>{children}</>
}
