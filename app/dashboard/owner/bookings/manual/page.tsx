"use client"

export default function ManualBookingPage() {
  return (
    <div className="max-w-3xl mx-auto bg-gray-900 border border-gray-800 rounded-lg p-6 space-y-4">
      <h2 className="text-lg font-semibold">Manual Booking</h2>
      <p className="text-sm text-gray-400">
        Create booking for walk-in customers
      </p>

      <input className="input" placeholder="Vehicle Number" />
      <input className="input" placeholder="Select Slot" />
      <input className="input" placeholder="Duration (hours)" />

      <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm">
        Create Booking
      </button>
    </div>
  )
}