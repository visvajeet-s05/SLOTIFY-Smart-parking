"use client"

import { useEffect, useState } from "react"

export default function OwnerInsightsPage() {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    fetch("/api/owner/insights")
      .then(res => res.json())
      .then(setData)
  }, [])

  if (!data) return <div>Loading insights...</div>

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold">Customer Insights</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <InsightCard label="Total Customers" value={data.totalCustomers} />
        <InsightCard label="Repeat Customers" value={data.repeatCustomers} />
        <InsightCard label="Peak Hour" value={`${data.peakHour}:00`} />
        <InsightCard label="Slot Utilization" value={`${data.slotUtilization}%`} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded p-4">
          <h3 className="font-medium mb-2">Peak Day</h3>
          <div className="text-2xl font-semibold">{data.peakDay || 'N/A'}</div>
        </div>
        
        <div className="bg-gray-900 border border-gray-800 rounded p-4">
          <h3 className="font-medium mb-2">Vehicle Distribution</h3>
          <ul className="text-sm text-gray-400 space-y-1">
            {data.vehicles.map((v: any) => (
              <li key={v.make}>
                {v.make}: {v._count}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

function InsightCard({ label, value }: { label: string; value: any }) {
  return (
    <div className="admin-card">
      <div className="text-xs text-gray-400">{label}</div>
      <div className="text-xl font-semibold mt-1">{value}</div>
    </div>
  )
}
