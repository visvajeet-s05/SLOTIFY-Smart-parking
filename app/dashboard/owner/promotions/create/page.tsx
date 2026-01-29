"use client"

export default function CreatePromotionPage() {
  return (
    <div className="max-w-3xl mx-auto bg-gray-900 border border-gray-800 rounded-lg p-6 space-y-4">
      <h2 className="text-lg font-semibold">Create Promotion</h2>
      <p className="text-sm text-gray-400">
        Configure discounts for customers
      </p>

      <input
        placeholder="Promotion Code (e.g. SAVE20)"
        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
      />

      <select className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm">
        <option>Discount Type</option>
        <option>Percentage (%)</option>
        <option>Flat Amount (₹)</option>
      </select>

      <input
        placeholder="Discount Value"
        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
      />

      <select className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm">
        <option>Applicable Parking Lot</option>
        <option>All Parking Lots</option>
        <option>Lot A</option>
        <option>Lot B</option>
      </select>

      <input
        type="date"
        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
      />

      <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm">
        Create Promotion
      </button>
    </div>
  )
}