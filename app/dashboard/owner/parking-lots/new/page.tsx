"use client"

export default function AddParkingLotPage() {
  return (
    <div className="max-w-3xl mx-auto bg-gray-900 border border-gray-800 rounded-lg p-6 space-y-4">
      <h2 className="text-xl font-semibold">Add New Parking Lot</h2>
      <p className="text-sm text-gray-400">
        Enter basic details about your parking facility
      </p>

      <input
        placeholder="Parking Lot Name"
        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
      />

      <input
        placeholder="Full Address / Location"
        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
      />

      <input
        placeholder="Total Number of Slots"
        type="number"
        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
      />

      <select className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm">
        <option>Covered Parking</option>
        <option>Open Parking</option>
        <option>Multi-Level Parking</option>
      </select>

      <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm">
        Save & Continue
      </button>
    </div>
  )
}
