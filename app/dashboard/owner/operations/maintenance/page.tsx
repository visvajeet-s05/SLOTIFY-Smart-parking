"use client"

export default function OwnerMaintenancePage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Maintenance Schedule</h1>
        <p className="text-sm text-gray-400">
          Plan maintenance and block availability
        </p>
      </div>

      {/* ADD MAINTENANCE */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-5 space-y-3">
        <h3 className="font-medium">Schedule Maintenance</h3>

        <input
          placeholder="Parking Lot / Slot"
          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
        />

        <input
          type="date"
          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
        />

        <textarea
          placeholder="Maintenance description"
          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm h-20"
        />

        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm">
          Schedule
        </button>
      </div>

      {/* MAINTENANCE LIST */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
        <h3 className="font-medium mb-3">Upcoming Maintenance</h3>

        <div className="space-y-2 text-sm">
          <div className="admin-card flex justify-between">
            <span>Slot B04 • Electrical repair</span>
            <span className="text-yellow-400">Scheduled</span>
          </div>

          <div className="admin-card flex justify-between">
            <span>Lot 2 • Resurfacing</span>
            <span className="text-green-400">Completed</span>
          </div>
        </div>
      </div>
    </div>
  )
}
