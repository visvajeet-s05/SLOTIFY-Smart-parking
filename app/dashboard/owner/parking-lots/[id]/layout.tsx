"use client"

import { useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import OwnerNavbar from "@/components/navigation/OwnerNavbar"

export default function OwnerParkingLotLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const params = useParams()
  const parkingLotId = params.id as string

  useEffect(() => {
    const role = localStorage.getItem("role")
    if (role !== "OWNER") {
      router.replace("/dashboard")
    }
  }, [router])

  return (
    <div className="min-h-screen bg-black">
      {/* OWNER NAVBAR */}
      <OwnerNavbar />

      {/* PAGE CONTENT */}
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </main>
    </div>
  )
}
