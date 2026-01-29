"use client"

export default function OwnerInvoicesPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Invoices</h1>
      <p className="text-sm text-gray-400">
        Monthly earnings and tax breakdown
      </p>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-sm">
        <div className="grid grid-cols-6 font-medium text-gray-400 mb-2">
          <div>Month</div>
          <div>Gross</div>
          <div>Commission</div>
          <div>Tax</div>
          <div>Net</div>
          <div>Status</div>
        </div>

        <div className="grid grid-cols-6 text-gray-300">
          <div>Jan 2026</div>
          <div>₹120,000</div>
          <div>₹12,000</div>
          <div>₹18,000</div>
          <div>₹90,000</div>
          <div className="text-green-400">Generated</div>
        </div>
      </div>
    </div>
  )
}
