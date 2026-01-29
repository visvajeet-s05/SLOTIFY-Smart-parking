"use client"

export default function EntryExitLogsPage() {
  return (
    <div className="max-w-6xl mx-auto bg-gray-900 border border-gray-800 rounded-lg p-6">
      <h2 className="text-lg font-semibold">Entry / Exit Logs</h2>

      <div className="mt-4 text-sm text-gray-400">
        Time • Vehicle • Slot • Entry / Exit • Verified By
      </div>

      <div className="mt-4 admin-card text-sm">
        Logs will appear here in real-time
      </div>
    </div>
  )
}