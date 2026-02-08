"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { SessionProvider, useSession } from "next-auth/react"
import OwnerNavbar from "@/components/navigation/OwnerNavbar"
import { OwnerWebSocketProvider } from "@/components/ws/OwnerWebSocketProvider"

import { OWNER_PARKING_MAPPING } from "@/lib/owner-mapping"

function OwnerLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === "loading") return

    if (status === "unauthenticated" || (session && session.user.role !== "OWNER")) {
      router.replace("/dashboard")
    }
  }, [session, status, router])


  // Get owner's parking lot ID from session
  const ownerEmail = (session?.user?.email || "").toLowerCase()
  const lotId = session?.user?.parkingLotId || OWNER_PARKING_MAPPING[ownerEmail]

  // Don't render until we have session data
  if (status === "loading" || !lotId) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    )
  }

  return (
    <OwnerWebSocketProvider lotId={lotId}>
      <div className="min-h-screen bg-black">
        {/* OWNER NAVBAR ONLY */}
        <OwnerNavbar />

        {/* PAGE CONTENT */}
        <main className="pt-10">
          {children}
        </main>
      </div>
    </OwnerWebSocketProvider>
  )
}

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <OwnerLayoutContent>{children}</OwnerLayoutContent>
    </SessionProvider>
  )
}
