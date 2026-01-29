"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { isAdmin } from "@/lib/role"

export default function AdminDashboard() {
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    // Redirect if not admin
    if (session?.user && !isAdmin(session.user.role)) {
      router.push("/dashboard")
    }
  }, [session, router])

  if (!session?.user || !isAdmin(session.user.role)) {
    return <div className="p-4 text-center text-gray-400">Access denied. Admin only.</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
          >
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <p className="text-gray-400 text-sm">Total Users</p>
            <p className="text-2xl font-bold text-white mt-2">—</p>
            <p className="text-xs text-gray-500 mt-1">User management coming soon</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <p className="text-gray-400 text-sm">Total Bookings</p>
            <p className="text-2xl font-bold text-white mt-2">—</p>
            <p className="text-xs text-gray-500 mt-1">Booking reports coming soon</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <p className="text-gray-400 text-sm">Total Revenue</p>
            <p className="text-2xl font-bold text-white mt-2">—</p>
            <p className="text-xs text-gray-500 mt-1">Payment tracking coming soon</p>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">Admin Info</h2>
          <div className="text-gray-300 space-y-2">
            <p><span className="text-gray-400">Name:</span> {session.user.email}</p>
            <p><span className="text-gray-400">Email:</span> {session.user.email}</p>
            <p><span className="text-gray-400">Role:</span> <span className="text-purple-400 font-semibold">{session.user.role}</span></p>
          </div>
        </div>

        <div className="mt-8 bg-blue-900/20 border border-blue-700 p-4 rounded-lg">
          <p className="text-blue-300 text-sm">
            💡 Admin features (user management, booking reports, revenue analytics) coming soon!
          </p>
        </div>
      </div>
    </div>
  )
}
