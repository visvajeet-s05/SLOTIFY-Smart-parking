"use client"

export default function AdminTransactionsPage() {
  return (
    <div className="max-w-7xl mx-auto bg-gray-900 border border-gray-800 rounded-lg p-6">
      <h2 className="text-lg font-semibold">Transaction Monitor</h2>
      <p className="text-sm text-gray-400 mb-4">
        View all customer payments and refunds.
      </p>

      <div className="bg-gray-800/30 p-4 rounded text-sm">
        Transactions table  
        (Booking ID, Customer, Amount, Status, Payment Method)
      </div>
    </div>
  )
}
