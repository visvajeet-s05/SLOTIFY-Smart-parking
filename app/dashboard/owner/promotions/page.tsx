"use client"

import Link from "next/link"

export default function OwnerPromotionsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Promotions</h1>
        <p className="text-sm text-gray-400">
          Manage discounts and special offers for your parking lots
        </p>
      </div>

      {/* Active Promotions */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
        <h3 className="font-medium mb-3">Active Promotions</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="admin-card">
            <div className="text-sm font-medium">WELCOME10</div>
            <p className="text-xs text-gray-400 mt-1">
              10% off • All parking lots
            </p>
            <p className="text-xs text-green-400 mt-1">
              Active • Ends in 5 days
            </p>
          </div>

          <div className="admin-card">
            <div className="text-sm font-medium">EV20</div>
            <p className="text-xs text-gray-400 mt-1">
              ₹20 off • EV Slots Only
            </p>
            <p className="text-xs text-green-400 mt-1">
              Active • Unlimited
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/dashboard/owner/promotions/create" className="admin-card">
          Create Promotion
        </Link>
        <Link href="/dashboard/owner/promotions/analytics" className="admin-card">
          Promotion Analytics
        </Link>
      </div>
    </div>
  )
}