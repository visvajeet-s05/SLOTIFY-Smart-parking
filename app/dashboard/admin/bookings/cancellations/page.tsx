"use client"

export default function AdminBookingCancellationsPage() {
  return (
    <div className="max-w-6xl mx-auto bg-gray-900 border border-gray-800 rounded-lg p-6">
      <h2 className="text-lg font-semibold">Cancellation Analysis</h2>
      <p className="text-sm text-gray-400 mb-4">
        Understand why bookings are cancelled.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="admin-card">User Cancelled: 48%</div>
        <div className="admin-card">Owner Cancelled: 21%</div>
        <div className="admin-card">Payment Failure: 31%</div>
      </div>

      <div className="mt-4 bg-gray-800/30 p-4 rounded text-sm">
        Cancellation logs & filters (date, location, reason)
      </div>
    </div>
  )
}
