export default function Step5Amenities({
  onNext,
  onPrev,
}: {
  onNext: () => void
  onPrev: () => void
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Amenities & Photos</h2>

      <div className="space-y-2">
        <label className="flex items-center space-x-2">
          <input type="checkbox" className="rounded" />
          <span>24/7 Security</span>
        </label>
        <label className="flex items-center space-x-2">
          <input type="checkbox" className="rounded" />
          <span>Covered Parking</span>
        </label>
        <label className="flex items-center space-x-2">
          <input type="checkbox" className="rounded" />
          <span>EV Charging</span>
        </label>
      </div>

      <div className="h-32 border border-dashed border-gray-700 rounded flex items-center justify-center text-gray-500">
        Upload Photos
      </div>

      <div className="flex justify-between">
        <button onClick={onPrev} className="text-sm text-gray-400">
          Back
        </button>
        <button onClick={onNext} className="bg-purple-600 px-4 py-2 rounded text-sm">
          Continue
        </button>
      </div>
    </div>
  )
}