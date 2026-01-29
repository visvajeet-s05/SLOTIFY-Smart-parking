"use client"

import Link from "next/link"

export default function OwnerRevenuePage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Revenue Dashboard</h1>
        <p className="text-sm text-gray-400">
          Earnings, payouts, and tax summaries
        </p>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="admin-card">Total Earnings: ₹2,45,800</div>
        <div className="admin-card">This Month: ₹48,200</div>
        <div className="admin-card">Pending Payout: ₹12,500</div>
        <div className="admin-card">GST Collected: ₹7,420</div>
      </div>

      {/* NAVIGATION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/dashboard/owner/revenue/invoices" className="admin-card">
          View Invoices
        </Link>
        <Link href="/dashboard/owner/revenue/settlements" className="admin-card">
          Settlement History
        </Link>
      </div>
    </div>
  )
}
