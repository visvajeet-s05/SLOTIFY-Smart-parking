export default function Step3Slots({
  onNext,
  onPrev,
}: {
  onNext: () => void
  onPrev: () => void
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Slot Configuration</h2>

      <input className="input" placeholder="Total Slots" type="number" />
      <input className="input" placeholder="Available Slots" type="number" />

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