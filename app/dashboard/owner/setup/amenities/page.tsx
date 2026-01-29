"use client"

import { useRouter } from "next/navigation"

export default function AmenitiesStep() {
  const router = useRouter()

  const submit = async () => {
    await fetch("/api/owner/setup/complete", { method: "POST" })
    router.push("/dashboard/owner")
  }

  return (
    <div className="max-w-xl mx-auto bg-gray-900 border border-gray-800 rounded-lg p-6 space-y-4">
      <h3 className="text-lg font-semibold">Amenities & Photos</h3>

      <p className="text-sm text-gray-400">
        Upload photos & select amenities (next phase)
      </p>

      <button
        onClick={submit}
        className="w-full bg-purple-600 hover:bg-purple-700 py-2 rounded text-sm"
      >
        Submit for Review
      </button>
    </div>
  )
}
