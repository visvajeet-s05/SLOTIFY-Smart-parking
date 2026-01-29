"use client"

export default function AdminBookingAnalyticsPage() {
  return (
    <div className="max-w-6xl mx-auto bg-gray-900 border border-gray-800 rounded-lg p-6 space-y-4">
      <h2 className="text-lg font-semibold">Booking Analytics</h2>
      <p className="text-sm text-gray-400">
        Booking trends and performance metrics.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="admin-card">Peak Hour: 6–9 PM</div>
        <div className="admin-card">Avg Duration: 2.4 hrs</div>
        <div className="admin-card">Repeat Users: 62%</div>
      </div>

      <div className="bg-gray-800/30 p-4 rounded text-sm">
        Charts placeholder  
        (Daily / Weekly / Monthly bookings)
      </div>
    </div>
  )
}
