"use client"

export default function AdminVerificationPage() {
  return (
    <div className="max-w-6xl mx-auto bg-gray-900 border border-gray-800 rounded-lg p-6">
      <h2 className="text-lg font-semibold">Verification Queue</h2>
      <p className="text-sm text-gray-400 mb-4">
        Pending owner & business verifications.
      </p>

      <div className="bg-yellow-900/20 border border-yellow-700 p-4 rounded text-sm">
        Pending documents, KYC, parking proof  
        Approve / Reject buttons will be added here
      </div>
    </div>
  )
}
