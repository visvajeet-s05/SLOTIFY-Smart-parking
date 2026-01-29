"use client"

export default function OwnerTaxReportsPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Tax Reports</h1>
        <p className="text-sm text-gray-400">
          GST / tax-ready financial summaries.
        </p>
      </div>

      {/* Tax Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="admin-card">
          <div className="text-xs text-gray-400">Gross Revenue</div>
          <div className="text-xl font-semibold">₹ 3,45,200</div>
        </div>
        <div className="admin-card">
          <div className="text-xs text-gray-400">Tax Collected</div>
          <div className="text-xl font-semibold">₹ 62,136</div>
        </div>
        <div className="admin-card">
          <div className="text-xs text-gray-400">Net Payout</div>
          <div className="text-xl font-semibold">₹ 2,83,064</div>
        </div>
      </div>

      {/* Export */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
        <button className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded text-sm">
          Download Tax Report (PDF)
        </button>
      </div>
    </div>
  )
}
