"use client"

import Link from "next/link"

export default function OwnerReportsPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Financial Reports</h1>
      <p className="text-sm text-gray-400">
        Access invoices, settlements, and tax documents.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/dashboard/owner/reports/invoices" className="admin-card">
          Invoices
        </Link>

        <Link href="/dashboard/owner/reports/tax" className="admin-card">
          Tax Reports
        </Link>

        <div className="admin-card text-gray-400">
          Settlement Summary (Coming soon)
        </div>
      </div>
    </div>
  )
}
