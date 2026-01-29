export default function Step4Pricing({
  onNext,
  onPrev,
}: {
  onNext: () => void
  onPrev: () => void
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Pricing</h2>

      <input className="input" placeholder="Hourly Rate (₹)" type="number" />
      <input className="input" placeholder="Daily Rate (₹)" type="number" />
      <input className="input" placeholder="Monthly Rate (₹)" type="number" />

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