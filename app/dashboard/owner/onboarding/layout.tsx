"use client"

import { ReactNode, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

export default function OwnerOnboardingLayout({
  children,
}: {
  children: ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status !== "loading") {
      if (!session) router.push("/")
      else if (session.user.role !== "OWNER") router.push("/dashboard")
    }
  }, [session, status, router])

  if (status === "loading" || !session) return null

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
      <div className="w-full max-w-3xl bg-gray-900 border border-gray-800 rounded-lg p-8">
        {children}
      </div>
    </div>
  )
}
