"use client"

import React, { useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useSession, signOut } from "next-auth/react"
import AdminSidebar from "@/components/admin/sidebar"
import AdminHeader from "@/components/admin/header"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status !== "loading") {
      if (!session) router.push("/")
      else if (session.user.role !== "ADMIN") router.push("/dashboard")
    }
  }, [session, status, router])

  if (status === "loading") {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black">
        <div className="h-16 w-16 animate-spin rounded-full border-t-4 border-purple-500"></div>
      </div>
    )
  }

  if (!session || session.user.role !== "ADMIN") {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black text-white">
        Redirecting...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white pt-16">
      <div className="flex">
        <AdminSidebar onLogout={() => { signOut({ callbackUrl: '/' }); }} />
        <div className="flex-1 min-h-screen">
          <AdminHeader user={session.user} />
          <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="p-6">
            {children}
          </motion.main>
        </div>
      </div>
    </div>
  )
}
