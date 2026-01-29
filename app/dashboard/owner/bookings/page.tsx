"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { canManage } from "@/lib/permissions"
import { redirect } from "next/navigation"

export default function OwnerBookingsPage() {
  const { data: session } = useSession()

  if (!session?.user || !canManage(session.user.role)) {
    redirect("/dashboard/owner")
  }
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Bookings</h1>
        <p className="text-sm text-gray-400">
          Manage all parking reservations
        </p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="admin-card">Active: 24</div>
        <div className="admin-card">Upcoming: 61</div>
        <div className="admin-card">Completed: 1,832</div>
        <div className="admin-card text-red-400">Issues: 2</div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/dashboard/owner/bookings/qr" className="admin-card">
          QR Verification
        </Link>

        <Link href="/dashboard/owner/bookings/manual" className="admin-card">
          Manual Booking
        </Link>

        <Link href="/dashboard/owner/bookings/logs" className="admin-card">
          Entry / Exit Logs
        </Link>
      </div>

      {/* Table Placeholder */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-sm text-gray-400">
        Booking table (Customer • Vehicle • Slot • Time • Status)
      </div>
    </div>
  )
}
