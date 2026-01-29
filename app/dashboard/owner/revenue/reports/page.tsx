"use client"

export default function OwnerFinancialReportsPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Financial Reports</h2>
        <p className="text-sm text-gray-400">
          Download invoices, tax summaries and earnings reports
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="admin-card">
          Monthly Revenue Report
        </div>
        <div className="admin-card">
          Tax Summary (GST / VAT)
        </div>
        <div className="admin-card">
          Annual Earnings Statement
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-sm text-gray-400">
        PDF / CSV export integrations will be available here
      </div>
    </div>
  )
}