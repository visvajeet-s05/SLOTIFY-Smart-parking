"use client"

export default function AdminOwnersPage() {
  return (
    <div className="max-w-6xl mx-auto bg-gray-900 border border-gray-800 rounded-lg p-6">
      <h2 className="text-lg font-semibold">Parking Owners</h2>
      <p className="text-sm text-gray-400 mb-4">
        Manage registered parking owners.
      </p>

      <div className="bg-gray-800/30 p-4 rounded text-sm">
        Owner list with approval status  
        (approved / pending / rejected)
      </div>
    </div>
  )
}
