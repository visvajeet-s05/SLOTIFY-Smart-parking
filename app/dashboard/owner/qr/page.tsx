"use client"

import { useSession } from "next-auth/react"
import { canScan } from "@/lib/permissions"

export default function OwnerQRScannerPage() {
  const { data: session } = useSession()

  if (!session?.user || !canScan(session.user.role)) {
    return <p>Access denied</p>
  }
  return (
    <div className="max-w-xl mx-auto bg-gray-900 border border-gray-800 rounded-lg p-6 space-y-4 text-center">
      <h1 className="text-2xl font-semibold">QR Verification</h1>

      <p className="text-sm text-gray-400">
        Scan customer QR code for entry or exit validation
      </p>

      {/* Scanner Placeholder */}
      <div className="h-64 border border-dashed border-gray-700 rounded flex items-center justify-center text-gray-500">
        Camera / QR Scanner Integration
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <button className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm">
          Mark Entry
        </button>

        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm">
          Mark Exit
        </button>
      </div>
    </div>
  )
}
