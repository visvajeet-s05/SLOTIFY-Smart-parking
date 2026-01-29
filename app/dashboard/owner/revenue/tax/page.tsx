"use client"

export default function OwnerTaxPage() {
  return (
    <div className="max-w-6xl mx-auto bg-gray-900 border border-gray-800 rounded-lg p-6">
      <h2 className="text-lg font-semibold">Tax Reports</h2>
      <p className="text-sm text-gray-400 mb-4">
        Tax and fee breakdowns for accounting
      </p>

      <div className="space-y-3 text-sm">
        <div className="admin-card">
          Gross Revenue: ₹82,400
        </div>
        <div className="admin-card">
          Platform Fee (10%): ₹8,240
        </div>
        <div className="admin-card">
          GST (18% on fee): ₹1,483
        </div>
        <div className="admin-card text-green-400">
          Net Earnings: ₹72,677
        </div>
      </div>
    </div>
  )
}