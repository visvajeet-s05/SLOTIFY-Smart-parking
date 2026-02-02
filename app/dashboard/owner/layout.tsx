"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function OwnerLayout({ children }: any) {
  const router = useRouter()

  useEffect(() => {
    const role = localStorage.getItem("role")
    if (role !== "OWNER") {
      router.replace("/dashboard")
    }
  }, [])

  return <>{children}</>
}