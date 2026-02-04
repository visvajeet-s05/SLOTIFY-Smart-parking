"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { BookingFilters } from "@/components/admin/bookings/booking-filters"
import { BookingTable } from "@/components/admin/bookings/booking-table"
import DashboardShell from "@/components/ui/DashboardShell"

export default function AdminGlobalBookingsPage() {
  return (
    <DashboardShell>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-2xl font-semibold">Global Bookings</h1>
          <p className="text-sm text-gray-400">
            Monitor, audit, and control all bookings across the platform.
          </p>
        </motion.div>

        {/* KPI Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
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
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <BookingFilters />
        </motion.div>

        {/* Booking Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <BookingTable />
        </motion.div>

        {/* Sub-modules */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6"
        >
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
        </motion.div>
      </div>
    </DashboardShell>
  )
}
