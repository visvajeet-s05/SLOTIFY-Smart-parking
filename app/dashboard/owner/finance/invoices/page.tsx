"use client"

export default function OwnerInvoicesPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Invoices</h1>
        <p className="text-sm text-gray-400">
          Download invoices for completed settlements.
        </p>
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-sm">
        <div className="grid grid-cols-6 text-gray-400 mb-3">
          <span>Invoice ID</span>
          <span>Period</span>
          <span>Amount</span>
          <span>Tax</span>
          <span>Status</span>
          <span>Action</span>
        </div>

        <div className="grid grid-cols-6 items-center admin-card text-sm">
          <span>#INV-2024-09</span>
          <span>Sep 2024</span>
          <span>₹ 84,500</span>
          <span>₹ 15,210</span>
          <span className="text-green-400">Paid</span>
          <button className="text-purple-400 hover:underline">
            Download
          </button>
        </div>
      </div>
    </div>
  )
}
