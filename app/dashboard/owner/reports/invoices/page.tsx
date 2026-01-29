"use client"

export default function OwnerInvoicesPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h2 className="text-xl font-semibold">Invoices</h2>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
        <div className="text-sm text-gray-400 mb-3">
          Invoice ID • Date • Amount • Status
        </div>

        <div className="admin-card flex justify-between text-sm">
          <span>#INV-2024-001 • 12 Apr 2024</span>
          <span>₹ 18,400 • Paid</span>
        </div>

        <div className="admin-card flex justify-between text-sm mt-2">
          <span>#INV-2024-002 • 18 Apr 2024</span>
          <span>₹ 22,100 • Pending</span>
        </div>
      </div>
    </div>
  )
}
