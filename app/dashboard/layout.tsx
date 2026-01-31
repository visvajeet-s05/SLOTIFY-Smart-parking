"use client"

import React, { useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useSession } from "next-auth/react"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status !== "loading" && !session) {
      router.push("/")
    }
  }, [session, status, router])

  // Show loader while auth is loading
  if (status === "loading") {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black">
        <div className="h-16 w-16 animate-spin rounded-full border-t-4 border-purple-500"></div>
      </div>
    )
  }

  // Show redirect message if user is null (optional)
  if (status === "unauthenticated") {
    return (
      <div className="flex h-screen w-full items-center justify-center text-white bg-black">
        Redirecting...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col flex-1"
      >
        <main className="flex-1 p-4 overflow-x-hidden">{children}</main>
      </motion.div>
    </div>
  )
}
