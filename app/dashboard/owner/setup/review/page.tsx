export default function ReviewStep() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Review & Confirm</h2>

      <div className="space-y-4">
        <div className="admin-card">
          <h3 className="font-medium">Business Information</h3>
          <p className="text-sm text-gray-400">Business Name: [Business Name]</p>
          <p className="text-sm text-gray-400">GST: [GST Number]</p>
        </div>

        <div className="admin-card">
          <h3 className="font-medium">Location</h3>
          <p className="text-sm text-gray-400">[Address]</p>
        </div>

        <div className="admin-card">
          <h3 className="font-medium">Slots & Pricing</h3>
          <p className="text-sm text-gray-400">Total Slots: [Count]</p>
          <p className="text-sm text-gray-400">Hourly Rate: ₹[Rate]</p>
        </div>

        <div className="admin-card">
          <h3 className="font-medium">Amenities</h3>
          <p className="text-sm text-gray-400">[Selected Amenities]</p>
        </div>
      </div>

      <button className="btn-primary">
        Complete Setup
      </button>
    </div>
  )
}