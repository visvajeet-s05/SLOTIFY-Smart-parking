"use client"

import { useState } from "react"

export default function OwnerVerificationPage() {
  const [status] = useState<"PENDING" | "APPROVED" | "REJECTED">("PENDING")

  return (
    <div className="max-w-xl mx-auto bg-gray-900 border border-gray-800 rounded-lg p-6 space-y-4">
      <h2 className="text-lg font-semibold">Business Verification</h2>

      <p className="text-sm text-gray-400">
        Upload required documents to verify your parking business.
      </p>

      {status === "PENDING" && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-3 text-sm text-yellow-400">
          Verification pending admin approval
        </div>
      )}

      {status === "REJECTED" && (
        <div className="bg-red-500/10 border border-red-500/30 rounded p-3 text-sm text-red-400">
          Verification rejected. Please re-upload documents.
        </div>
      )}

      <div className="space-y-3">
        <input type="file" className="input" />
        <input type="file" className="input" />
      </div>

      <button className="w-full bg-purple-600 hover:bg-purple-700 py-2 rounded text-sm">
        Submit for Verification
      </button>
    </div>
  )
}