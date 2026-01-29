"use client"

export default function OwnerTaxReportsPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Tax Reports</h1>
      <p className="text-sm text-gray-400">
        GST / tax-ready summaries for accounting.
      </p>

      <div className="admin-card text-left">
        <div className="text-sm font-medium mb-2">
          FY 2025-26 Summary
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>Total Revenue: ₹ 5,12,000</div>
          <div>Platform Commission: ₹ 51,200</div>
          <div>Taxable Amount: ₹ 4,60,800</div>
          <div>Estimated GST: ₹ 82,944</div>
        </div>

        <button className="mt-4 px-4 py-2 bg-purple-600 rounded text-sm">
          Download Tax Report (PDF)
        </button>
      </div>
    </div>
  )
}
