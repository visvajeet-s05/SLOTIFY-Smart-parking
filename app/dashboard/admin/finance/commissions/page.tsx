"use client"

import { Button } from "@/components/ui/button"

export default function AdminCommissionPage() {
  return (
    <div className="max-w-5xl mx-auto bg-gray-900 border border-gray-800 rounded-lg p-6 space-y-4">
      <h2 className="text-lg font-semibold">Commission Settings</h2>
      <p className="text-sm text-gray-400">
        Configure platform commission rates.
      </p>

      <div className="admin-card">
        <p className="text-sm">Current Commission Rate</p>
        <h3 className="text-2xl font-semibold">15%</h3>
      </div>

      <Button className="bg-purple-600 hover:bg-purple-700">
        Update Commission
      </Button>
    </div>
  )
}
