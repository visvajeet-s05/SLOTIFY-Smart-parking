export default function BusinessStep() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Business Information</h2>

      <input className="input" placeholder="Business Name" />
      <input className="input" placeholder="GST / Registration Number" />
      <input className="input" placeholder="Contact Phone" />

      <button className="btn-primary">
        Save & Continue
      </button>
    </div>
  )
}