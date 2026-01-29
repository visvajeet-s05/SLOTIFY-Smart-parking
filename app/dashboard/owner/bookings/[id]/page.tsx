"use client"

export default function OwnerBookingDetailPage() {
  return (
    <div className="max-w-3xl mx-auto bg-gray-900 border border-gray-800 rounded-lg p-6 space-y-4">
      <h2 className="text-lg font-semibold">Booking #SP-20492</h2>

      <div className="text-sm text-gray-400">
        Vehicle: KA-05-MH-2211 <br />
        Slot: A-12 <br />
        Time: 10:00 AM – 2:00 PM
      </div>

      <div className="flex items-center justify-center h-48 border border-dashed border-gray-700 rounded">
        QR Code Rendered Here
      </div>

      <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm">
        Report Incident
      </button>
    </div>
  )
}
