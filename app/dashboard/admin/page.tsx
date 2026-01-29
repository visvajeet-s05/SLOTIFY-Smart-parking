"use client"

import Link from "next/link"
import { BookingFilters } from "@/components/admin/bookings/booking-filters"
import { BookingTable } from "@/components/admin/bookings/booking-table"

export default function AdminGlobalBookingsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Global Bookings</h1>
        <p className="text-sm text-gray-400">
          Monitor, audit, and control all bookings across the platform.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="admin-card">
          <div className="text-xs text-gray-400">Active</div>
          <div className="text-2xl font-semibold mt-1">128</div>
        </div>

        <div className="admin-card">
          <div className="text-xs text-gray-400">Upcoming</div>
          <div className="text-2xl font-semibold mt-1">342</div>
        </div>

        <div className="admin-card">
          <div className="text-xs text-gray-400">Completed</div>
          <div className="text-2xl font-semibold mt-1">8,214</div>
        </div>

        <div className="admin-card border-red-500/40">
          <div className="text-xs text-red-400">Flagged</div>
          <div className="text-2xl font-semibold mt-1 text-red-400">6</div>
        </div>
      </div>

      {/* Filters */}
      <BookingFilters />

      {/* Booking Table */}
      <BookingTable />

      {/* Sub-modules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
        <Link
          href="/dashboard/admin/bookings/analytics"
          className="admin-card text-center"
        >
          <div className="font-medium">Booking Analytics</div>
          <div className="text-xs text-gray-400 mt-1">
            Trends, conversions, performance
          </div>
        </Link>

        <Link
          href="/dashboard/admin/bookings/cancellations"
          className="admin-card text-center"
        >
          <div className="font-medium">Cancellations</div>
          <div className="text-xs text-gray-400 mt-1">
            Reasons, refunds, patterns
          </div>
        </Link>

        <Link
          href="/dashboard/admin/bookings/fraud"
          className="admin-card text-center"
        >
          <div className="font-medium text-red-400">Fraud Detection</div>
          <div className="text-xs text-gray-400 mt-1">
            Suspicious activity & flags
          </div>
        </Link>
      </div>
    </div>
  )
}
