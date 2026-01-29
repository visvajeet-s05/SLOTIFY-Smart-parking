"use client"

export default function OwnerPayoutsPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Payout History</h2>
        <p className="text-sm text-gray-400">
          Track all settlements received from the platform
        </p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-sm">
        Date • Amount • Method • Status • Reference ID
      </div>

      <div className="admin-card text-sm">
        12 Aug 2025 • ₹ 42,000 • Bank Transfer • Completed • PAY_9821
      </div>

      <div className="admin-card text-sm text-yellow-400">
        28 Aug 2025 • ₹ 18,200 • Bank Transfer • Pending • PAY_9912
      </div>
    </div>
  )
}