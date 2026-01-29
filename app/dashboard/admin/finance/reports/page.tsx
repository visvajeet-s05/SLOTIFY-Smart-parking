"use client"

export default function AdminFinanceReportsPage() {
  return (
    <div className="max-w-6xl mx-auto bg-gray-900 border border-gray-800 rounded-lg p-6">
      <h2 className="text-lg font-semibold">Financial Reports</h2>
      <p className="text-sm text-gray-400 mb-4">
        Export platform financial data.
      </p>

      <div className="bg-gray-800/30 p-4 rounded text-sm">
        Monthly / Yearly revenue reports  
        CSV / PDF export (coming soon)
      </div>
    </div>
  )
}
