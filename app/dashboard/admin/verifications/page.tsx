"use client"

export default function AdminVerificationQueuePage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Owner Verification Queue</h1>
        <p className="text-sm text-gray-400">
          Review and approve parking owner accounts
        </p>
      </div>

      <div className="admin-card text-sm">
        Owner • Business • Documents • Status • Action
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
        <div className="flex justify-between items-center text-sm">
          <div>
            <p className="font-medium">John Parking Pvt Ltd</p>
            <p className="text-gray-400">GST: 29ABCDE1234F1Z5</p>
          </div>

          <div className="flex gap-2">
            <button className="px-3 py-1 bg-green-600/20 text-green-400 rounded">
              Approve
            </button>
            <button className="px-3 py-1 bg-red-600/20 text-red-400 rounded">
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}