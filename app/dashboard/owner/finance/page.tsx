"use client"

import Link from "next/link"

export default function OwnerFinancePage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Financial Overview</h1>
        <p className="text-sm text-gray-400">
          Invoices, settlements, and tax documentation.
        </p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="admin-card">
          <div className="text-xs text-gray-400">Total Earnings</div>
          <div className="text-xl font-semibold">₹ 3,45,200</div>
        </div>
        <div className="admin-card">
          <div className="text-xs text-gray-400">Pending Settlement</div>
          <div className="text-xl font-semibold">₹ 28,000</div>
        </div>
        <div className="admin-card">
          <div className="text-xs text-gray-400">Platform Commission</div>
          <div className="text-xl font-semibold">₹ 41,300</div>
        </div>
      </div>

      {/* Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/dashboard/owner/finance/invoices" className="admin-card">
          View Invoices
        </Link>
        <Link href="/dashboard/owner/finance/tax-reports" className="admin-card">
          Tax Reports
        </Link>
      </div>
    </div>
  )
}
