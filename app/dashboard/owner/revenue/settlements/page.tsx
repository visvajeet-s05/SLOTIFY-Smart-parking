"use client"

export default function OwnerSettlementsPage() {
  return (
    <div className="max-w-6xl mx-auto bg-gray-900 border border-gray-800 rounded-lg p-6">
      <h2 className="text-lg font-semibold">Settlement History</h2>
      <p className="text-sm text-gray-400 mb-4">
        Track all payouts processed by the platform
      </p>

      <div className="space-y-3 text-sm">
        <div className="admin-card flex justify-between">
          <span>15 Mar 2025</span>
          <span className="text-green-400">₹28,500 — Paid</span>
        </div>
        <div className="admin-card flex justify-between">
          <span>28 Feb 2025</span>
          <span className="text-green-400">₹31,200 — Paid</span>
        </div>
        <div className="admin-card flex justify-between">
          <span>15 Feb 2025</span>
          <span className="text-yellow-400">₹12,500 — Pending</span>
        </div>
      </div>
    </div>
  )
}