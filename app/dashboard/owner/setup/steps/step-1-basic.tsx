export default function Step1Basic({ onNext }: { onNext: () => void }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Parking Details</h2>

      <input className="input" placeholder="Parking Lot Name" />
      <input className="input" placeholder="Contact Number" />
      <textarea className="input" placeholder="Description" />

      <button
        onClick={onNext}
        className="bg-purple-600 px-4 py-2 rounded text-sm"
      >
        Continue
      </button>
    </div>
  )
}