"use client"

export default function SettlementHistoryPage() {
  return (
    <div className="max-w-6xl mx-auto bg-gray-900 border border-gray-800 rounded-lg p-6 space-y-4">
      <h2 className="text-lg font-semibold">Settlement History</h2>

      <div className="text-sm text-gray-400">
        Date • Amount • Commission • Status
      </div>

      <div className="admin-card text-sm">
        10 Sep 2026 • ₹18,200 • ₹1,820 • Completed
      </div>

      <div className="admin-card text-sm">
        05 Sep 2026 • ₹22,400 • ₹2,240 • Pending
      </div>
    </div>
  )
}