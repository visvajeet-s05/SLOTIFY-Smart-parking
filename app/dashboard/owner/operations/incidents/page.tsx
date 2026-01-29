"use client"

export default function OwnerIncidentsPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Incident Reports</h1>
        <p className="text-sm text-gray-400">
          Report damages, disputes, or unusual events
        </p>
      </div>

      {/* CREATE INCIDENT */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-5 space-y-3">
        <h3 className="font-medium">New Incident</h3>

        <input
          placeholder="Vehicle Number / Slot / Booking ID"
          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
        />

        <textarea
          placeholder="Describe the incident"
          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm h-24"
        />

        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm">
          Submit Incident
        </button>
      </div>

      {/* INCIDENT LIST */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
        <h3 className="font-medium mb-3">Reported Incidents</h3>

        <div className="space-y-2 text-sm">
          <div className="admin-card flex justify-between">
            <span>Slot A12 • Scratched bumper</span>
            <span className="text-yellow-400">Open</span>
          </div>

          <div className="admin-card flex justify-between">
            <span>Booking #8431 • Payment dispute</span>
            <span className="text-green-400">Resolved</span>
          </div>
        </div>
      </div>
    </div>
  )
}
