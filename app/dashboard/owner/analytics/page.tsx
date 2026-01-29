"use client"

import { BarChart, LineChart, TrendingUp } from "lucide-react"

export default function OwnerAnalyticsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Analytics Overview</h1>
        <p className="text-sm text-gray-400">
          Performance insights for your parking business.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <AnalyticsCard title="Monthly Revenue" value="₹ 1,24,500" icon={<TrendingUp />} />
        <AnalyticsCard title="Total Bookings" value="842" icon={<BarChart />} />
        <AnalyticsCard title="Avg Occupancy" value="78%" icon={<LineChart />} />
        <AnalyticsCard title="Peak Hour" value="6 PM – 9 PM" icon={<LineChart />} />
      </div>

      {/* Charts Section (Placeholder-ready) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartCard
          title="Daily Revenue"
          description="Revenue trend over the last 7 days"
        />

        <ChartCard
          title="Occupancy Pattern"
          description="Hourly usage distribution"
        />
      </div>

      {/* Insights */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
        <h3 className="font-medium mb-2">AI Insights (Preview)</h3>
        <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside">
          <li>Peak demand observed on weekends</li>
          <li>EV slots show higher utilization</li>
          <li>Dynamic pricing could increase revenue by ~12%</li>
        </ul>
      </div>
    </div>
  )
}

/* ---------- Components ---------- */

function AnalyticsCard({
  title,
  value,
  icon,
}: {
  title: string
  value: string
  icon: React.ReactNode
}) {
  return (
    <div className="admin-card flex items-center justify-between">
      <div>
        <div className="text-xs text-gray-400">{title}</div>
        <div className="text-xl font-semibold mt-1">{value}</div>
      </div>
      <div className="text-purple-400">{icon}</div>
    </div>
  )
}

function ChartCard({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
      <h3 className="font-medium">{title}</h3>
      <p className="text-xs text-gray-400 mb-4">{description}</p>

      <div className="h-48 flex items-center justify-center text-gray-500 border border-dashed border-gray-700 rounded">
        Chart will be rendered here
      </div>
    </div>
  )
}
