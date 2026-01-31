"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import OwnerNavbar from "@/components/navigation/OwnerNavbar"
import AnimatedBackground from "@/components/ui/AnimatedBackground"

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status !== "loading") {
      if (!session) router.replace("/")
      if (session?.user?.role !== "OWNER") router.replace("/")
    }
  }, [session, status, router])

  if (status === "loading" || !session) return null

  return (
    <div className="relative min-h-screen bg-black text-white">
      <AnimatedBackground />
      <OwnerNavbar />
      <main className="pt-16">{children}</main>
    </div>
  )
}
