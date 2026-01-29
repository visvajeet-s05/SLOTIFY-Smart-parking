"use client"

export default function OwnerNotificationPreferencesPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Notification Preferences</h1>
        <p className="text-sm text-gray-400">
          Control how and when you receive alerts
        </p>
      </div>

      {/* Booking Alerts */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-5 space-y-3">
        <h3 className="font-medium">Booking Notifications</h3>

        <Toggle label="New Booking Created" />
        <Toggle label="Booking Cancelled" />
        <Toggle label="Booking Extended" />
      </div>

      {/* Operational Alerts */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-5 space-y-3">
        <h3 className="font-medium">Operational Alerts</h3>

        <Toggle label="QR Verification Failures" />
        <Toggle label="Incident Reports" />
        <Toggle label="Maintenance Reminders" />
      </div>

      {/* Financial Alerts */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-5 space-y-3">
        <h3 className="font-medium">Financial Alerts</h3>

        <Toggle label="Daily Revenue Summary" />
        <Toggle label="Payout Processed" />
        <Toggle label="Payment Failures" />
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded text-sm">
          Save Preferences
        </button>
      </div>
    </div>
  )
}

/* ---------- Toggle Component ---------- */
function Toggle({ label }: { label: string }) {
  return (
    <label className="flex items-center justify-between text-sm">
      <span>{label}</span>
      <input type="checkbox" className="accent-purple-600 w-4 h-4" defaultChecked />
    </label>
  )
}