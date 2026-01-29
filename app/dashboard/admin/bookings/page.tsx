"use client"

import Link from "next/link"

export default function AdminGlobalBookingsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Global Bookings</h1>
        <p className="text-sm text-gray-400">
          Monitor all bookings across the platform.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="admin-card">Active: 128</div>
        <div className="admin-card">Upcoming: 342</div>
        <div className="admin-card">Completed: 8,214</div>
        <div className="admin-card text-red-400">Flagged: 6</div>
      </div>

      {/* Table placeholder */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-sm">
        Booking table  
        (Booking ID • Customer • Owner • Location • Status • Amount • Actions)
      </div>

      {/* Navigation */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/dashboard/admin/bookings/analytics" className="admin-card">
          Analytics
        </Link>
        <Link href="/dashboard/admin/bookings/cancellations" className="admin-card">
          Cancellations
        </Link>
        <Link href="/dashboard/admin/bookings/fraud" className="admin-card">
          Fraud Detection
        </Link>
      </div>
    </div>
  )
}
