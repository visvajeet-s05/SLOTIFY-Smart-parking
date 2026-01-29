export default function Step6Review({ onPrev }: { onPrev: () => void }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Review & Submit</h2>

      <div className="space-y-3 text-sm">
        <div className="bg-gray-800 p-3 rounded">
          <strong>Parking Name:</strong> [Data from Step 1]
        </div>
        <div className="bg-gray-800 p-3 rounded">
          <strong>Location:</strong> [Data from Step 2]
        </div>
        <div className="bg-gray-800 p-3 rounded">
          <strong>Slots:</strong> [Data from Step 3]
        </div>
        <div className="bg-gray-800 p-3 rounded">
          <strong>Pricing:</strong> [Data from Step 4]
        </div>
      </div>

      <div className="flex justify-between">
        <button onClick={onPrev} className="text-sm text-gray-400">
          Back
        </button>
        <button className="bg-green-600 px-4 py-2 rounded text-sm">
          Submit Parking Lot
        </button>
      </div>
    </div>
  )
}