"use client"

import Link from "next/link"

export default function AdminFinanceDashboard() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Financial Overview</h1>
        <p className="text-sm text-gray-400">
          Platform revenue, commissions, and payouts.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="admin-card">
          <p className="text-xs text-gray-400">Total Revenue</p>
          <h2 className="text-xl font-semibold">₹ 12,45,000</h2>
        </div>

        <div className="admin-card">
          <p className="text-xs text-gray-400">Platform Commission</p>
          <h2 className="text-xl font-semibold">₹ 1,86,000</h2>
        </div>

        <div className="admin-card">
          <p className="text-xs text-gray-400">Owner Payouts</p>
          <h2 className="text-xl font-semibold">₹ 9,80,000</h2>
        </div>

        <div className="admin-card">
          <p className="text-xs text-gray-400">Pending Settlements</p>
          <h2 className="text-xl font-semibold text-yellow-400">₹ 79,000</h2>
        </div>
      </div>

      {/* Finance Navigation */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/dashboard/admin/finance/transactions" className="admin-card">
          Transactions
        </Link>
        <Link href="/dashboard/admin/finance/commissions" className="admin-card">
          Commissions
        </Link>
        <Link href="/dashboard/admin/finance/payouts" className="admin-card">
          Payouts
        </Link>
        <Link href="/dashboard/admin/finance/reports" className="admin-card">
          Reports
        </Link>
      </div>
    </div>
  )
}
