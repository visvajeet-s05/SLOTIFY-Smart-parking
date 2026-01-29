"use client"

export default function PromotionAnalyticsPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Promotion Analytics</h2>
        <p className="text-sm text-gray-400">
          Measure effectiveness of your offers
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="admin-card">
          Total Redemptions<br />
          <span className="text-xl font-semibold">428</span>
        </div>
        <div className="admin-card">
          Revenue Impact<br />
          <span className="text-xl font-semibold">₹ 64,200</span>
        </div>
        <div className="admin-card">
          Conversion Rate<br />
          <span className="text-xl font-semibold">18%</span>
        </div>
        <div className="admin-card">
          Best Promo<br />
          <span className="text-xl font-semibold">WELCOME10</span>
        </div>
      </div>

      {/* Chart Placeholder */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
        <h3 className="font-medium mb-2">Redemption Trend</h3>
        <div className="h-48 flex items-center justify-center border border-dashed border-gray-700 rounded text-gray-500">
          Chart integration placeholder
        </div>
      </div>
    </div>
  )
}