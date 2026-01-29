"use client"

export default function AmenitiesPage() {
  return (
    <div className="max-w-4xl mx-auto bg-gray-900 border border-gray-800 rounded-lg p-6 space-y-3">
      <h2 className="text-lg font-semibold">Amenities</h2>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" /> EV Charging
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" /> CCTV Surveillance
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" /> Covered Parking
      </label>
    </div>
  )
}
