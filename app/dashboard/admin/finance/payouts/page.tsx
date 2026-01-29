"use client"

import { Button } from "@/components/ui/button"

export default function AdminPayoutsPage() {
  return (
    <div className="max-w-7xl mx-auto bg-gray-900 border border-gray-800 rounded-lg p-6">
      <h2 className="text-lg font-semibold">Owner Payouts</h2>
      <p className="text-sm text-gray-400 mb-4">
        Review and approve owner settlements.
      </p>

      <div className="bg-gray-800/30 p-4 rounded text-sm space-y-3">
        <div className="flex justify-between items-center">
          <span>ABC Parking Pvt Ltd — ₹45,000</span>
          <Button size="sm" className="bg-green-600 hover:bg-green-700">
            Approve
          </Button>
        </div>

        <div className="flex justify-between items-center">
          <span>SkyPark Ltd — ₹34,000</span>
          <Button size="sm" className="bg-green-600 hover:bg-green-700">
            Approve
          </Button>
        </div>
      </div>
    </div>
  )
}
