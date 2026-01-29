"use client"

import { Button } from "@/components/ui/button"

export default function AdminFraudDetectionPage() {
  return (
    <div className="max-w-7xl mx-auto bg-gray-900 border border-gray-800 rounded-lg p-6 space-y-4">
      <h2 className="text-lg font-semibold text-red-400">Fraud Detection</h2>
      <p className="text-sm text-gray-400">
        Detect suspicious booking patterns.
      </p>

      <div className="bg-red-900/10 border border-red-500/30 rounded p-4 space-y-3 text-sm">
        <div className="flex justify-between">
          <span>User: customer@test.com — 9 rapid cancellations</span>
          <Button size="sm" variant="destructive">Flag</Button>
        </div>

        <div className="flex justify-between">
          <span>Owner: XYZ Parking — abnormal pricing spikes</span>
          <Button size="sm" variant="destructive">Investigate</Button>
        </div>
      </div>
    </div>
  )
}
