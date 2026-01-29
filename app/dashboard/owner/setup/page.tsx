"use client"

import Link from "next/link"

export default function OwnerSetupPage() {
  return (
    <div className="max-w-xl mx-auto bg-gray-900 border border-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-2">
        Complete Parking Setup
      </h2>

      <p className="text-sm text-gray-400 mb-6">
        Finish setup to activate your parking listing.
      </p>

      <Link
        href="/dashboard/owner/setup/location"
        className="block text-center bg-purple-600 hover:bg-purple-700 py-2 rounded"
      >
        Start Setup
      </Link>
    </div>
  )
}