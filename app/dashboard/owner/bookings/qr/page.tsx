"use client"

export default function OwnerQRScannerPage() {
  return (
    <div className="max-w-xl mx-auto bg-gray-900 border border-gray-800 rounded-lg p-6 space-y-4 text-center">
      <h2 className="text-lg font-semibold">QR Verification</h2>
      <p className="text-sm text-gray-400">
        Scan customer QR code for entry or exit
      </p>

      <div className="h-64 border border-dashed border-gray-700 rounded flex items-center justify-center text-gray-500">
        Camera / QR Scanner Integration
      </div>

      <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm w-full">
        Verify Booking
      </button>
    </div>
  )
}