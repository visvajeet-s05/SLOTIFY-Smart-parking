"use client"

export default function AdminCustomersPage() {
  return (
    <div className="max-w-6xl mx-auto bg-gray-900 border border-gray-800 rounded-lg p-6">
      <h2 className="text-lg font-semibold">Customers</h2>
      <p className="text-sm text-gray-400 mb-4">
        View, suspend, or delete customer accounts.
      </p>

      <div className="bg-gray-800/30 p-4 rounded text-sm">
        Customer table will appear here  
        (name, email, status, actions)
      </div>
    </div>
  )
}
