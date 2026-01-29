export default function Step2Location({
  onNext,
  onPrev,
}: {
  onNext: () => void
  onPrev: () => void
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Location</h2>

      <div className="h-56 border border-dashed border-gray-700 rounded flex items-center justify-center text-gray-500">
        Map Picker (Google / Mapbox)
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