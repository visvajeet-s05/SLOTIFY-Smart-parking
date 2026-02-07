"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { SessionProvider, useSession } from "next-auth/react"
import OwnerNavbar from "@/components/navigation/OwnerNavbar"
import { OwnerWebSocketProvider } from "@/components/ws/OwnerWebSocketProvider"

// Owner to Parking Lot mapping - 1 owner → 1 parking lot only
const OWNER_PARKING_MAPPING: Record<string, string> = {
  "owner@gmail.com": "CHENNAI_CENTRAL",
  "owner1@gmail.com": "ANNA_NAGAR",
  "owner2@gmail.com": "T_NAGAR",
  "owner3@gmail.com": "VELACHERY",
  "owner4@gmail.com": "OMR",
  "owner5@gmail.com": "ADYAR",
  "owner6@gmail.com": "GUINDY",
  "owner7@gmail.com": "PORUR"
}

function OwnerLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    const role = localStorage.getItem("role")
    if (role !== "OWNER") {
      router.replace("/dashboard")
    }
  }, [])

  // Get owner's parking lot ID from session
  const ownerEmail = session?.user?.email || ""
  const lotId = OWNER_PARKING_MAPPING[ownerEmail]

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
        <main className="pt-16">
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
