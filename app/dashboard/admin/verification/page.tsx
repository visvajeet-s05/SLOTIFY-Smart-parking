"use client"

export default function AdminVerificationPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Owner Verification</h1>
        <p className="text-sm text-gray-400">
          Review and approve parking owner businesses
        </p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 space-y-3">
        <div className="flex justify-between items-center">
          <div>
            <p className="font-medium">ABC Parking Pvt Ltd</p>
            <p className="text-xs text-gray-400">Documents submitted</p>
          </div>

          <div className="flex gap-2">
            <button className="px-3 py-1 bg-green-600 rounded text-sm">
              Approve
            </button>
            <button className="px-3 py-1 bg-red-600 rounded text-sm">
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}